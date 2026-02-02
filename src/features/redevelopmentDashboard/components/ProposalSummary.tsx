import Tabs from "@/ui/components/Tab/Tab";
import React, { useMemo, useState } from "react";

interface Props {
  proposedOfferProposedPlanData: any[];
  tenantData: any[];
}

const ProposalSummary: React.FC<Props> = ({
  proposedOfferProposedPlanData,
  tenantData
}) => {

  const tabList = [
    { id: "Residential", label: "Residential" },
    { id: "Commercial", label: "Commercial" },
  ];

  const [activeTab, setActiveTab] = useState<string>(tabList[0].id);

  // ================= PLAN DATA =================

  const plan = proposedOfferProposedPlanData?.[0] || {};

  const totalFloors = plan.TotalNumberOfFloors || 0;
  const totalUnits = plan.TotalUnits || 0;
  const totalParking = plan.TotalParking || 0;

  // ================= UNIT DISTRIBUTION =================

  const unitDistribution = useMemo(() => {

    const grouped: Record<string, number> = {};

    tenantData
      .filter(x => x.FlatType?.toUpperCase() === activeTab.toUpperCase())
      .forEach(x => {

        const config = x.FlatConfiguration?.trim();

        if (!config || config.toUpperCase() === "SELECT FLAT CONFIGURATION") return;

        grouped[config] = (grouped[config] || 0) + 1;
      });

    return Object.entries(grouped)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

  }, [tenantData, activeTab]);

  // ================= AMENITIES =================

  const amenitiesList =
    typeof plan?.Amenities === "string"
      ? [...new Set((plan.Amenities as string).split(","))]
        .map(x => x.trim())
      : [];


  return (

    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-5">

      {/* LEFT : PROPOSED PLAN */}
      <div className="col-span-12 md:col-span-6 bg-white rounded-xl p-4" style={{boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

        <h3 className="text-sm text-gray-500 mb-4 font-medium">
          Proposed Plan
        </h3>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-3 gap-4 mb-5">

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Total Floors</p>
            <p className="text-lg font-semibold">{totalFloors}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Total Units</p>
            <p className="text-lg font-semibold">{totalUnits}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Total Parking</p>
            <p className="text-lg font-semibold">{totalParking}</p>
          </div>

        </div>

        {/* UNIT DISTRIBUTION */}
        <p className="text-sm text-gray-500 font-medium mb-2">
          Unit Distribution
        </p>

        <Tabs
          tabs={tabList}
          defaultActive={activeTab}
          islarge
          isChips
          onTabChange={(t) => setActiveTab(t.id)}
        />

        <div className="mt-3">

          {unitDistribution.map((item, index) => (
            <div
              key={index}
              className="flex justify-between py-2 text-sm border-b border-gray-200"
            >
              <span>{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}

        </div>

      </div>

      {/* RIGHT : AMENITIES */}
      <div className="col-span-12 md:col-span-6 bg-white rounded-xl p-4 h-[350px] flex flex-col" style={{boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

        <h3 className="text-sm font-medium text-gray-500 mb-4">
          Amenities
        </h3>

        {/* Scroll Area */}
        <div className="flex-1 overflow-y-auto thin-scroll">

          <div className="grid grid-cols-2 gap-3 pr-1">

            {amenitiesList.map((amenity: string, index: number) => (
              <div
                key={index}
                className="bg-blue-50 rounded-lg px-4 py-2 text-medium text-blue-800"
              >
                {amenity}
              </div>
            ))}

          </div>

        </div>

      </div>


    </div>
  );
};

export default ProposalSummary;
