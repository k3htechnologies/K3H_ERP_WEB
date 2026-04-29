
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
import { runApiWithLoader } from "@/core/utils";
import { bookingService } from '@/features/booking/services/BookingService';
import type { BookingData, FilterWithPaginationBookingRequest } from '@/features/booking/models/BookingModel';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import * as E from 'fp-ts/Either';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from '@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel';
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
export const ViewPayTrack: React.FC = () => {

  const navigate = useNavigate();
  const { listState, updateListState } = usePayTrackBookingListState();
  const { bookingName, bookingType, flat } = listState;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [welcome, setWelcome] = useState<string>("");

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // APPROVAL LOG MODAL
  const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
  const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>("");

  // APPROVAL ACTION MODAL
  const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
  const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
  const [approvalRowData, setApprovalRowData] = useState<BookingData | null>(null);

  const { addToast } = useToast();
  const { projectId } = useProject();

  const bookingTabList = [
    { id: 'BookingForm', label: 'Overview' },
    { id: 'BankLoans', label: 'Bank Loans' },
    { id: 'Account', label: 'Account' },
    { id: 'ModifiedRequest', label: 'Modified Request' },
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

  useEffect(() => {
    if (!projectId || !listState.bookingId) return;
    loadBookingData();
  }, [projectId, listState.bookingId, listState.refreshKey]);

  const loadBookingData = async () => {
    if (!listState.bookingId) return;
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationBookingRequest = {
          PageNumber: 1,
          PageSize: 1,
          BookingId: listState.bookingId,
          ProjectId: Number(projectId),
          IsCheckPermission: false
        };

        const response = await bookingService.apiCallPullBooking(params);

        if (E.isRight(response)) {
          const booking = response.right.Data?.[0] ?? null;
          setBookingData(booking);
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
      'Loading Booking Data'
    );
  };

  const handleApprovalLog = (row: BookingData) => {
    const request: ModulesApprovalStatusRequest = {
      ModuleName: "BOOKING REFUND APPROVAL",
      Id: row.BookingId ?? 0,
      ProjectId: projectId ? Number(projectId) : 0,
      SubId: row.BookingId ?? 0
    };
    setOwnerName(row.ApplicantName);
    setApprovalLogRequest(request);
    setIsApprovalLogModalOpen(true);
  };

  const handleApproveRejectDocument = (row: BookingData, approvalType: "approve" | "reject") => {
    setApprovalRowData(row);
    setOwnerName(row.ApplicantName);
    setApprovalActionType(approvalType);
    setIsApprovalActionModalOpen(true);
  };

  const handleApprovalSubmit = async (remark: string) => {
    if (!approvalRowData) return;

    const payload: UpdateModulesWorkflowApprovalRequest = {
      ModuleName: "BOOKING REFUND APPROVAL",
      Id: approvalRowData.BookingId ?? 0,
      ProjectId: projectId ? Number(projectId) : 0,
      IsApproved: approvalActionType === "approve",
      Remarks: remark ?? null,
      SubId: approvalRowData.BookingId ?? 0
    };

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

        if (E.isRight(response)) {
          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });
          setIsApprovalActionModalOpen(false);
          await loadBookingData();
        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      approvalActionType === "approve" ? "Approving Refund" : "Rejecting Refund"
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>
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
              showApproval={bookingData?.IsApproval}
              isIcons={true}
              onHistory={() => handleApprovalLog(bookingData)}
              onApprove={() => handleApproveRejectDocument(bookingData, "approve")}
              onReject={() => handleApproveRejectDocument(bookingData, "reject")}
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

      <ApprovalActionModal
        title="Refund Details Action"
        isOpen={isApprovalActionModalOpen}
        onClose={() => setIsApprovalActionModalOpen(false)}
        actionType={approvalActionType}
        titleText={ownerName ?? ""}
        onSubmit={handleApprovalSubmit}
        loading={isLoading}
      />
    </div>
  )
}

export default ViewPayTrack
