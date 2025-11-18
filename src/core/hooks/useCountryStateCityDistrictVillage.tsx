import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import * as E from 'fp-ts/Either'
import type { CountryStateCityDistrictVillageData } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';

// Generic option type for dropdowns
export interface CountryStateCityDistrictVillageOption {
  id: number
  name: string
}

interface CountryStateCityDistrictVillageContextValue {
  isLoading: boolean
  error: string | null

  countries: CountryStateCityDistrictVillageOption[]
  statesByCountryId: Record<number, CountryStateCityDistrictVillageOption[]>
  districtsByStateId: Record<number, CountryStateCityDistrictVillageOption[]>
  citiesByDistrictId: Record<number, CountryStateCityDistrictVillageOption[]>
  villagesByCityId: Record<number, CountryStateCityDistrictVillageOption[]>
}

const CountryStateCityDistrictVillageContext = createContext<CountryStateCityDistrictVillageContextValue | undefined>(
  undefined,
)

export const CountryStateCityDistrictVillage: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [value, setValue] = useState<CountryStateCityDistrictVillageContextValue>({
    isLoading: true,
    error: null,
    countries: [],
    statesByCountryId: {},
    districtsByStateId: {},
    citiesByDistrictId: {},
    villagesByCityId: {},
  })

  useEffect(() => {
    let isMounted = true

    const loadLocations = async () => {
      try {
        const result = await technicalService.apiCallCountryStateDistrictCityVillage()

        if (!isMounted) return

        if (E.isLeft(result)) {
          setValue(prev => ({
            ...prev,
            isLoading: false,
            error: result.left.message ?? 'Failed to load locations',
          }))
          return
        }

        // 👉 Adjust this line according to your real response property name
        const list: CountryStateCityDistrictVillageData[] =
          result.right.Data?.CountryStateCityDistrictVillageData || [];

        const {
          countries,
          statesByCountryId,
          districtsByStateId,
          citiesByDistrictId,
          villagesByCityId,
        } = buildLocationMaps(list)

        setValue({
          isLoading: false,
          error: null,
          countries,
          statesByCountryId,
          districtsByStateId,
          citiesByDistrictId,
          villagesByCityId,
        })
      } catch (err: any) {
        if (!isMounted) return
        setValue(prev => ({
          ...prev,
          isLoading: false,
          error: err?.message ?? 'Unexpected error while loading locations',
        }))
      }
    }

    loadLocations()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <CountryStateCityDistrictVillageContext.Provider value={value}>
      {children}
    </CountryStateCityDistrictVillageContext.Provider>
  )
}

// Helper to build cascading maps
function buildLocationMaps(list: CountryStateCityDistrictVillageData[]) {
  const countryMap = new Map<number, string>()
  const statesByCountryId: Record<number, CountryStateCityDistrictVillageOption[]> = {}
  const districtsByStateId: Record<number, CountryStateCityDistrictVillageOption[]> = {}
  const citiesByDistrictId: Record<number, CountryStateCityDistrictVillageOption[]> = {}
  const villagesByCityId: Record<number, CountryStateCityDistrictVillageOption[]> = {}

  for (const row of list) {
    // Country
    if (!countryMap.has(row.CountryMasterId)) {
      countryMap.set(row.CountryMasterId, row.CountryName)
    }

    // State
    if (!statesByCountryId[row.CountryMasterId]) {
      statesByCountryId[row.CountryMasterId] = []
    }
    if (
      !statesByCountryId[row.CountryMasterId].some(
        s => s.id === row.StateMasterId,
      )
    ) {
      statesByCountryId[row.CountryMasterId].push({
        id: row.StateMasterId,
        name: row.StateName,
      })
    }

    // District
    if (!districtsByStateId[row.StateMasterId]) {
      districtsByStateId[row.StateMasterId] = []
    }
    if (
      !districtsByStateId[row.StateMasterId].some(
        d => d.id === row.DistrictMasterId,
      )
    ) {
      districtsByStateId[row.StateMasterId].push({
        id: row.DistrictMasterId,
        name: row.DistrictName,
      })
    }

    // City
    if (!citiesByDistrictId[row.DistrictMasterId]) {
      citiesByDistrictId[row.DistrictMasterId] = []
    }
    if (
      !citiesByDistrictId[row.DistrictMasterId].some(
        c => c.id === row.CityMasterId,
      )
    ) {
      citiesByDistrictId[row.DistrictMasterId].push({
        id: row.CityMasterId,
        name: row.CityName,
      })
    }

    // Village
    if (!villagesByCityId[row.CityMasterId]) {
      villagesByCityId[row.CityMasterId] = []
    }
    if (
      !villagesByCityId[row.CityMasterId].some(
        v => v.id === row.VillageMasterId,
      )
    ) {
      villagesByCityId[row.CityMasterId].push({
        id: row.VillageMasterId,
        name: row.VillageName,
      })
    }
  }

  const countries: CountryStateCityDistrictVillageOption[] = Array.from(countryMap.entries()).map(
    ([id, name]) => ({ id, name }),
  )

  return {
    countries,
    statesByCountryId,
    districtsByStateId,
    citiesByDistrictId,
    villagesByCityId,
  }
}

// Nice hook to use in components
export const useCountryStateCityDistrictVillageData = () => {
  const ctx = useContext(CountryStateCityDistrictVillageContext)
  if (!ctx) {
    throw new Error('useLocationData must be used within LocationProvider')
  }
  return ctx
}
