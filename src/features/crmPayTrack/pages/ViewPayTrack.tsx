
import { useState, useEffect } from "react";
import Tabs from '@/ui/components/Tab/Tab';
import BookingForm from "@/features/crmPayTrack/components/BookingForm";
import BankLoans from "@/features/crmPayTrack/pages/BankLoans";
import Account from "@/features/crmPayTrack/pages/Account";
import ModifiedRequest from "@/features/crmPayTrack/pages/ModifiedRequest";
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";
import { useNavigate } from 'react-router-dom';
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import BookingFlatHandoverFile from "@/features/crmPayTrack/components/BookingFlatHandoverFile";
import CallLog from "@/features/crmPayTrack/components/CallLog";
import { Mail } from "lucide-react";
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest } from '@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel';
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import type { PayTrackBookingData } from "@/features/crmPayTrack/models/PayTrackBookingModel";
import SnagChecklist from "@/features/crmPayTrack/components/SnagChecklist";
import FlatHandoverChecklist from "@/features/crmPayTrack/components/FlatHandoverCheckList";
export const ViewPayTrack: React.FC = () => {

  const navigate = useNavigate();
  
  const { listState, updateListState } = usePayTrackBookingListState();
  const { bookingName, bookingType, flat,bookingData } = listState;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [welcome, setWelcome] = useState<string>("");
  const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
  const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>("");

  const { projectId } = useProject();

  const bookingTabList = [
    { id: 'BookingForm', label: 'Overview' },
    { id: 'BankLoans', label: 'Bank Loans' },
    { id: 'Account', label: 'Account' },
    { id: 'ModifiedRequest', label: 'Modified Request' },
    { id: 'SnagChecklist', label: 'Snag Checklist' },
    { id: 'FlatHandoverChecklist', label: 'Flat Handover Checklist' },
    { id: 'FlatHandover', label: 'Flat Handover' },
    { id: 'Files', label: 'Files' },
    { id: 'Call Log', label: 'Call Logs' },
  ];

  const [activeTab, setActiveTab] = useState<string>(listState.activeTab || bookingTabList[0].id);

  useEffect(() => {
    if (listState.activeTab && listState.activeTab !== activeTab) {
      setActiveTab(listState.activeTab);
    }
  }, [listState.activeTab]);
  

  const handleApprovalLog = (row: PayTrackBookingData) => {

    const request: ModulesApprovalStatusRequest = {
      ModuleName: "BOOKING REFUND APPROVAL",
      Id: row.BookingId ?? 0,
      ProjectId: projectId ? Number(projectId) : 0,
    };

    setOwnerName(row.ApplicantName);
    setApprovalLogRequest(request);
    setIsApprovalLogModalOpen(true);
  };


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
     
      <div className="flex items-center justify-between pb-4">
        <div className="flex-1">
          <HeaderActionBar
            titleText={`Booking Details : ${bookingName}`}
            subTitleText={bookingType ?? ""}
            subSubTitleText={flat ?? ""}
            cancelText="Back"
            EditText="Edit"
            canAction={activeTab === "BookingForm" ? true : false}
            onEdit={() => {
              setIsModalOpen(true);
            }}
            onCancel={() => {
              navigate('/payTrack');
            }}

            ExtraButtontitleText="Welcome"
            ExtraButtontitleTextIcon={Mail}
            ExtraButtonText="Message"
            onExtraButton={() => setWelcome('Message')}
            canActionExtraButtonText={activeTab === "BookingForm" ? true : false}

            ExtraExtraButtonText="Send E-Mail"
            onExtraExtraButton={() => setWelcome('E-Mail')}
            canActionExtraExtraButton={activeTab === "BookingForm" ? true : false}
          />
        </div>

        {(activeTab === 'ModifiedRequest' && (bookingData?.ApprovalStatus === 'Cancel' || bookingData?.ApprovalStatus === 'Refund')) && (
          <div className="pl-4">
            <ApprovalActions
              approvalStatus={bookingData?.ApprovalStatus || "-"}
              onHistory={() => handleApprovalLog(bookingData)}
            />
          </div>
        )}

      </div>

      <div className='pt-5'>
        <Tabs
          tabs={bookingTabList}
          defaultActive={activeTab}
          islarge={true}
          onTabChange={(t) => {
            setActiveTab(t.id);
            updateListState({ activeTab: t.id });
          }}
          isChips={true}
        />
      </div>

      {activeTab === "BookingForm" && <BookingForm modalOpen={isModalOpen} setModalOpen={setIsModalOpen} welcome={welcome} setWelcome={setWelcome} />}
      {activeTab === "BankLoans" && <BankLoans />}
      {activeTab === "Account" && <Account />}
      {activeTab === "ModifiedRequest" && <ModifiedRequest />}
      {activeTab === "SnagChecklist" && <SnagChecklist />}
      {activeTab === "FlatHandoverChecklist" && <FlatHandoverChecklist />}
      {activeTab === "FlatHandover" && <BookingFlatHandoverFile fileType="FLAT HANDOVER" pageName="Flat Handover" />}
      {activeTab === "Files" && <BookingFlatHandoverFile fileType="FILES" pageName="Files" />}
      {activeTab === "Call Log" && <CallLog />}

      <ApprovalLogModal
        isOpen={isApprovalLogModalOpen}
        title='Refund Details'
        titleText={ownerName ?? ""}
        onClose={() => setIsApprovalLogModalOpen(false)}
        request={approvalLogRequest}
      />
     
    </div>
  )
}

export default ViewPayTrack
