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

  // ================= TOP SUMMARY =================

  const plan = proposedOfferProposedPlanData?.[0] || {};

  const totalFloors = plan.TotalNumberOfFloors || 0;
  const totalUnits = plan.TotalUnits || 0;
  const totalParking = plan.TotalParking || 0;

  // ================= UNIT DISTRIBUTION =================

  const unitDistribution = useMemo(() => {

    const grouped: Record<string, number> = {};

    tenantData
      // normalize BOTH sides
      .filter(x => x.FlatType?.toUpperCase() === activeTab.toUpperCase())
      .forEach(x => {

        const config = x.FlatConfiguration?.trim();

        // Skip invalid configs
        if (!config || config.toUpperCase() === "SELECT FLAT CONFIGURATION") return;

        grouped[config] = (grouped[config] || 0) + 1;
      });

    return Object.entries(grouped)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

  }, [tenantData, activeTab]);

  return (
    <div className="bg-white rounded-xl p-4 mt-5">

      {/* HEADER */}
      <h3 className="text-sm text-gray-500 mb-4">
        Proposed Plan
      </h3>

      {/* TOP SUMMARY CARDS */}
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
      <p className="text-sm text-gray-500 mb-2">
        Unit Distribution
      </p>

      {/* TABS */}
      <div className="border-b mb-3">
        <Tabs
          tabs={tabList}
          defaultActive={activeTab}
          islarge
          onTabChange={(t) => setActiveTab(t.id)}
        />
      </div>

      {/* DISTRIBUTION LIST */}
      <div className="divide-y">

        {unitDistribution.map((item, index) => (
          <div
            key={index}
            className="flex justify-between py-2 text-sm"
          >
            <span>{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}

        
      </div>

    </div>
  );
};

export default ProposalSummary;
