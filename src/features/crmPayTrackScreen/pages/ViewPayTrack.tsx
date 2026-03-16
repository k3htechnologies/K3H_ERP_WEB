import { useState } from "react";
import Tabs, { type TabItem } from "@/ui/components/Tab/Tab";
import BookingForm from "@/features/crmPayTrackScreen/components/BookingForm";
import BankLoans from "@/features/crmPayTrackScreen/pages/BankLoans";
import Account from "@/features/crmPayTrackScreen/pages/Account";
import ModifiedRequest from "@/features/crmPayTrackScreen/components/ModifiedRequest";
import FlatHandover from "@/features/crmPayTrackScreen/components/FlatHandover";
import Files from "@/features/crmPayTrackScreen/components/Files";


export const ViewPayTrack: React.FC = () => {

  const [activeTab, setActiveTab] = useState<"BookingForm" | "BankLoans" | "Account" | "ModifiedRequest" | "FlatHandover" | "Files">("BookingForm");

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

      <div className="mt-4">
        <Tabs

          tabs={[
            { id: "BookingForm", label: "Booking Form" },
            { id: "BankLoans", label: "Bank Loans" },
            { id: "Account", label: "Account" },
            { id: "ModifiedRequest", label: "Modified Request" },
            { id: "FlatHandover", label: "Flat Handover" },
            { id: "Files", label: "Files" },

          ]}
          defaultActive={activeTab}
          onTabChange={(tab: TabItem) => {
            setActiveTab(tab.id as "BookingForm" | "BankLoans" | "Account" | "ModifiedRequest" | "FlatHandover" | "Files");
          }}
          isChips={true}
        />
      </div>

      {/* Tabs Content */}
      <div className="mt-6">
        {activeTab === "BookingForm" && <BookingForm />}
        {activeTab === "BankLoans" && <BankLoans />}
        {activeTab === "Account" && <Account />}
        {activeTab === "ModifiedRequest" && <ModifiedRequest />}
        {activeTab === "FlatHandover" && <FlatHandover />}
        {activeTab === "Files" && <Files />}

      </div>

    </div>
  )
}

export default ViewPayTrack
