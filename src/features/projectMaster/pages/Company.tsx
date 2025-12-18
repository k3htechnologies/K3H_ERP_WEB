import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import React, { useEffect, useMemo, useState } from 'react'
import type { AddUpdateProjectMasterWithCompanyRequest } from '@/features/projectMaster/models/ProjectMasterModel';
import { DataTable, type FilterInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import type { CompanyMasterData, FilterWithPaginationCompanyMasterRequest } from '@/features/companyMaster/models/CompanyMasterModel';
import useToast from '@/core/hooks/useToast';
import { useLocation, useNavigate } from 'react-router-dom';
import { runApiWithLoader } from '@/core/utils';
import { ProjectMasterService } from '@/features/projectMaster/services/ProjectMasterService';
import * as E from 'fp-ts/Either';
import usePagination from '@/core/hooks/usePagination';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import { Loader } from '@/core/utils/loader';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { Modal } from '@/ui/components/Modal/Modal';
import Checkbox from '@/ui/components/forms/Checkbox';
import { Input } from '@/ui/components/forms';
import { Search } from 'lucide-react';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { CompanyMasterService } from '@/features/companyMaster/services/CompanyMasterService';

const Company: React.FC = () => {
  //#region STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const [compantMasterList, setCompanyMasterList] = useState<CompanyMasterData[]>([]);

  // TOAST
  const { addToast } = useToast()

  //LOCATION
  const navigate = useNavigate();

  const location = useLocation() as {
      state?: {
        listState?: {
          page?: number;
          filters?: any;
          sortInfo?: any;
          searchTerm?: string;
          projectId?: number;
          uniquekey?: string;
        };
      };
    };
    const preservedListState = location.state?.listState;
    const projectId = preservedListState?.projectId || 0;
    const uniquekey = preservedListState?.uniquekey || '';
  

  //FILTER STATES
  const [filters, setFilters] = useState<FilterInfo>({});

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/projectMaster');
  //#endregion


  //#region PROJECT MASTER WITH Company MODULE
  const [isOpenAddProjectMasterWithCompany, setIsOpenAddProjectMasterWithCompany] = useState(false);

  const { pagination: companyPagination, setPagination: setCompanyPagination } = usePagination(20);

  const [isFetchingMoreCompany, setIsFetchingMoreCompany] = useState(false);

  const [companyMasterForProject, setCompanyMasterForProject] = useState<CompanyMasterData[]>([]);

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>([]);

  const toggleCompanySelection = (id?: number) => {
    if (!id) return;
    setSelectedCompanyIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });

  };

  const visibleCompanyIds = companyMasterForProject.map(e => e.CompanyId).filter(Boolean) as number[];

  const isAllCompanyVisibleSelected = visibleCompanyIds.length > 0 && visibleCompanyIds.every(id => selectedCompanyIds.includes(id));


  const toggleCompanySelectAllVisible = () => {
    setSelectedCompanyIds(prev => {
      if (isAllCompanyVisibleSelected) {

        return prev.filter(id => !visibleCompanyIds.includes(id));
      } else {

        const set = new Set<number>([...prev, ...visibleCompanyIds]);
        return Array.from(set);
      }
    });
  };

  // SINGLE SEARCH TEXT BOX
  const [searchTermForCompany, setSearchTermForCompany] = useState('')
  const debouncedCompanySearch = useDebouncedCallback((value: string) => {
    searchCompany(value)
  }, 350)

  //#endregion

  //#region INIT
  useEffect(() => {

    loadProjectMasterWithCompany(projectId);

  }, []);
  //#endregion
  //#region FETCH COMPANY MASTER DETAILS
  const loadProjectMasterWithCompany = async (ProjectId: number) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const response = await ProjectMasterService.apiCallPullProjectMasterWithCompany(ProjectId);

        if (E.isRight(response)) {

          syncCompanySelection(response.right.Data);

        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Loading Company'
    );
  };

  const syncCompanySelection = (data: CompanyMasterData[] = []) => {

    setCompanyMasterList(data);

    const assignedIds = data.map(e => e.CompanyId).filter(Boolean) as number[];

    setSelectedCompanyIds(assignedIds);
  };

  //#endregion


  //#region TABLE COLUMN

  const projectMasterWithCompanyColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'CompanyName',
        label: 'Company Name',
        width: '33',
        sortable: false,
        align: 'center',
        fixed: 'left',
        render: (value) => value || ''
      },
      {
        key: 'CompanyType',
        label: 'Company Type',
        width: '33',
        sortable: false,
        align: 'center',
        render: (value) => value || ''
      },
      {
        key: 'ContactPerson',
        label: 'Contact Person',
        width: '33',
        sortable: false,
        align: 'center',
        render: (value) => value || ''
      },
      {
        key: 'MobileNumber',
        label: 'Mobile Number',
        width: '33',
        sortable: false,
        align: 'center',
        render: (value) => value || ''
      },
      {
        key: 'CityName',
        label: 'City',
        width: '33',
        sortable: false,
        align: 'center',
        render: (value) => value || ''
      },

    ],
    []
  )

  //#endregion

  //#region PROJECT MASTER WITH EMPLOYEE LIST SCROLL EVENT
  const handleCompanyListScrollInProjectMasterWithCompany = (e: React.UIEvent<HTMLDivElement>) => {

    const el = e.currentTarget;
    const threshold = 60; // how close to bottom before loading next page

    if (el.scrollHeight - el.scrollTop <= el.clientHeight + threshold) {

      if (companyPagination.currentPage < (companyPagination.totalPages || 0) && !isFetchingMoreCompany) {
        const nextPage = companyPagination.currentPage + 1;
        setIsFetchingMoreCompany(true);
        fetchCompanyList(nextPage).finally(() => setIsFetchingMoreCompany(false));
      }
    }
  };
  //#endregion

  //#region DATA LOADING | FETCH | FOR ADD COMPANY IN PROJECT 

  const fetchCompanyList = async (page: number = 1) => {
    return loadCompanys(page, filters);
  };


  const loadCompanys = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const params: FilterWithPaginationCompanyMasterRequest = {
          PageNumber: page,
          PageSize: companyPagination.pageSize,
          IsCheckPermission: false,
          CompanyName: filterParams.CompanyName?.trim() || undefined,
        }

        const response = await CompanyMasterService.apiCallPullCompanyMaster(params);

        if (E.isRight(response)) {

          setCompanyMasterForProject(prev =>
            page === 1
              ? response.right.Data
              : [...prev, ...(Array.isArray(response.right.Data) ? response.right.Data : [])]
          );

          setCompanyPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / companyPagination.pageSize),
          });

        } else {

          addToast({ type: 'error', title: response.left.message });

        }

        return response
      },
      undefined,
      (error: any) => {

        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Company'
    )
  }
  //#endregion

  //#region ADD UPDATE COMPANY IN PROJECT
  const handleAddUpdateProjectMasterWithCompanyModal = () => {

    setCompanyMasterForProject([]);

    setSearchTermForCompany("");

    setCompanyPagination({
      currentPage: 1,
      pageSize: companyPagination.pageSize,
      totalRecords: 0,
      totalPages: 0,
    });


    const assignedIds = (compantMasterList || [])
      .map(e => e.CompanyId)
      .filter(Boolean) as number[];
    setSelectedCompanyIds(assignedIds);

    fetchCompanyList(1);

    setIsOpenAddProjectMasterWithCompany(true);

  }
  //#endregion

  //#region ADD UPDATE PROJECT MASTER WITH COMPANY

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================

  const PushProjectMasterWithCompanyData = (): AddUpdateProjectMasterWithCompanyRequest => {
    return {
      ProjectId: projectId,
          Uniquekey: uniquekey,
      CompanyId: selectedCompanyIds.join(',')
    };

  };

  const handleAddUpdateProjectMasterWithCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCompanyIds.join(',') === "") {

      addToast({ type: "error", title: "At least one company is required" });
      return
    }

    await runApiWithLoader(
      setIsLoading,

      setIsLoadingMessage,
      async () => {

        const payload = PushProjectMasterWithCompanyData();

        const response = await ProjectMasterService.apiCallAddUpdateProjectMasterWithCompany(payload);

        if (E.isRight(response)) {

          syncCompanySelection(response.right.Data);

          setIsOpenAddProjectMasterWithCompany(false);

          setSelectedCompanyIds([]);

          setSearchTermForCompany("");

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

        } else {

          addToast({ type: "error", title: response.left?.message });

        }
        return response;
      },
      undefined,
      (error: any) => {

        addToast({ type: 'error', title: error.message })
      },
      undefined,

      "Add Project Master With Company"
    )

  };

  //#endregion

  //#region SERACH COMPANY  
  const searchCompany = async (searchValue: string) => {
    setSearchTermForCompany(searchValue);

    if (searchValue.trim() === '') {
      const emptyFilters: FilterInfo = {};
      setFilters(emptyFilters);
      await loadCompanys(1, emptyFilters);
      return;
    }

    const filterParams: FilterInfo = {
      CompanyName: searchValue.trim(),
    };

    setFilters(filterParams);
    await loadCompanys(1, filterParams);
  };

  //#endregion



  //#region  BACK TO PROJECT MASTER PAGE
  const handleBackToListProjectMaster = () => {
    navigate('/projectMaster', {
      state: { listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTermForEmployee: '' } }
    });
  };
  //#endregion
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" >
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <HeaderActionBar
        titleText={'Add Update Project Master With Employee Details'}
        cancelText="Cancel"
        EditText="Add | Update"
        onCancel={() => handleBackToListProjectMaster()}
        canAction={canAction}
        onEdit={() => {
          handleAddUpdateProjectMasterWithCompanyModal();

        }}
        isLoading={isLoading}
      />
      <div className='pt-5'>
        <DataTable
          data={compantMasterList}
          columns={projectMasterWithCompanyColumns}
          emptyMessage="No Bank Data Found"
          fixedHeight={true}
          maxHeight="calc(100vh - 255px)"
          recordsPerPage={20}
          className="flex-1"
          loading={isLoading}
        />
      </div>

      {/* IN PROJECT MASTER WTTH COMPANY MODAL */}
      <Modal
        isOpen={isOpenAddProjectMasterWithCompany}
        onClose={() => setIsOpenAddProjectMasterWithCompany(false)}
        title="Add Company"
        onSubmit={handleAddUpdateProjectMasterWithCompany}
        saveText="Save"
        resetText=""
        size="large-half"
      >
        <div className="space-y-4">

          <div className="px-2 py-2 border-b">
            <div className="flex items-center gap-3 w-full">

              {/* Select ALL */}
              <Checkbox

                id="select-all-company"
                checked={isAllCompanyVisibleSelected}
                onChange={() => toggleCompanySelectAllVisible()}
              />
              <div className="relative min-w-0 w-[526px]">
                <Input
                  type="text"
                  value={searchTermForCompany}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearchTermForCompany(v);
                    debouncedCompanySearch(v);
                  }}
                  placeholder="Search By Company"
                  leftIcon={<Search className="h-4 w-4 text-gray-400" />}

                />
              </div>


              <span className="text-sm text-gray-600 whitespace-nowrap right">
                {selectedCompanyIds.length} selected
              </span>

            </div>
          </div>


          <div className="space-y-4">
            <div
              className="flex-1 min-h-0 overflow-auto thin-scroll divide-y divide-gray-200"
              onScroll={handleCompanyListScrollInProjectMasterWithCompany}
              style={{ maxHeight: '55vh' }}>
              {companyMasterForProject.length > 0 ? (

                companyMasterForProject.map((n, i) => {

                  const id = n.CompanyId ?? i;
                  const checked = selectedCompanyIds.includes(id);

                  return (
                    <div key={id}
                      className="flex items-start gap-3 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer px-2"
                      onClick={(ev) => {
                        if ((ev.target as HTMLElement).tagName.toLowerCase() === 'input') return;
                        toggleCompanySelection(id);
                      }}>
                      <div className="flex items-center">

                        <Checkbox
                          checked={checked}
                          onChange={() => toggleCompanySelection(id)}
                          onClick={(ev) => ev.stopPropagation()}
                          aria-label={`Select ${n.CompanyName}`}
                        />

                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mt-1">
                          <p className="text-sm text-gray-800 whitespace-normal break-words">
                            {n.CompanyName}
                          </p>

                          <div className="text-xs text-gray-500">
                            {n.ContactPerson}
                          </div>
                        </div>


                      </div>
                    </div>
                  );
                })
              ) : (
                <NoDataView />
              )}

              {isFetchingMoreCompany && (

                <div className="py-3 text-center text-gray-400 text-sm">Loading more...</div>
              )}
            </div>
          </div>
        </div>
      </Modal>

    </div>
  )
}

export default Company
