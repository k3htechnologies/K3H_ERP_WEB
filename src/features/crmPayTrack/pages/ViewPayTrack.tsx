import { useState } from "react";
import Tabs from '@/ui/components/Tab/Tab';
import BookingForm from "@/features/crmPayTrack/components/BookingForm";
import BankLoans from "@/features/crmPayTrack/pages/BankLoans";
import Account from "@/features/crmPayTrack/pages/Account";
import ModifiedRequest from "@/features/crmPayTrack/pages/ModifiedRequest";
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";
import { useNavigate } from 'react-router-dom';
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import BankDocuments from "../components/BankDocuments";
export const ViewPayTrack: React.FC = () => {

  const navigate = useNavigate();
  const { listState } = usePayTrackBookingListState();
  const { bookingName, bookingType, flat } = listState;

  const bookingTabList = [
    { id: 'BookingForm', label: 'Overview' },
    { id: 'BankLoans', label: 'Bank Loans' },
    { id: 'Account', label: 'Account' },
    { id: 'ModifiedRequest', label: 'Modified Request' },
    { id: 'FlatHandover', label: 'Flat Handover' },
    { id: 'Files', label: 'Files' },
  ];

  const [activeTab, setActiveTab] = useState<string>(bookingTabList[0].id);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

      <HeaderActionBar
        titleText={`Booking Details : ${bookingName}`}
        subTitleText={bookingType ?? ""}
        subSubTitleText={flat ?? ""}
        cancelText="Back"
        EditText="Edit"
        onCancel={() => {
          navigate('/payTrack');
        }}

      />

      <div className='pt-5'>
        <Tabs
          tabs={bookingTabList}
          defaultActive={activeTab}
          islarge={true}
          onTabChange={(t) => {
            setActiveTab(t.id);
          }}
          isChips={true}
        />
      </div>

      {/* Tabs Content */}

      {activeTab === "BookingForm" && <BookingForm />}
      {activeTab === "BankLoans" && <BankLoans />}
      {activeTab === "Account" && <Account />}
      {activeTab === "ModifiedRequest" && <ModifiedRequest />}
      {activeTab === "FlatHandover" && <BankDocuments fileType="FLAT HANDOVER" />}
      {activeTab === "Files" && <BankDocuments fileType="FILES" />}

    </div>
  )
}

export default ViewPayTrack
