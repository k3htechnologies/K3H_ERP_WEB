import { useNavigate } from "react-router-dom";
import type { ChannelPartnerSourcingData } from "../models/ChannelPartnerSourcingModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useEffect, useState } from "react";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import type { FilterWithPaginationChannelPartnerSourcingRequest } from "../models/ChannelPartnerSourcingModel";
import { ChannelPartnerSourcingService } from "../services/ChannelPartnerSourcingService";
import { useChannelPartnerSourcingListState } from "../context/ChannelPartnerSourcingListStateContext";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { fetchChannelPartnerByMobileNumber } from "@/features/ChannelPartner/channelPartnerDropDown";

const ViewChannelPartnerSourcing: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [sourcingData, setSourcingData] = useState<ChannelPartnerSourcingData | null>(null);

  const { listState } = useChannelPartnerSourcingListState();

  const { projectId } = useProject();

  //SET CHANNEL PARTNER DETAILS
  const [channelPartnerId, setChannelPartnerId] = useState<number>();
  const [channelPartnerFullName, setChannelPartnerFullName] = useState<string>();
  const [channelPartnerCompanyName, setChannelPartnerCompanyName] = useState<string>();
  const [channelPartnerFirmsType, setChannelPartnerFirmsType] = useState<string>();
  const [channelPartnerPanNumber, setChannelPartnerPanNumber] = useState<string>();
  const [channelPartnerAadhaarCardNumber, setChannelPartnerAadhaarCardNumber] = useState<string>();
  const [channelPartnerRERANUmber, setChannelPartnerRERANUmber] = useState<string>();

  useEffect(() => {
    if (listState.channelPartnerId) {
      loadSourcingDetails();
    }
  }, [listState.channelPartnerId]);

  useEffect(() => {
    const mobile = listState.channelPartnerMobileNumber?.trim() || "";

    fetchChannelPartnerByMobileNumber(mobile).then(channelPartner => {
      if (!channelPartner) return;

      setChannelPartnerId(Number(channelPartner.ChannelPartnerId));

      setChannelPartnerFullName(channelPartner.Name ?? "");
      setChannelPartnerFirmsType(channelPartner.FirmsType ?? "");
      setChannelPartnerCompanyName(channelPartner.CompanyName ?? "");
      setChannelPartnerPanNumber(channelPartner.PanNumber ?? "");
      setChannelPartnerAadhaarCardNumber(channelPartner.AadharCardNumber ?? "");
      setChannelPartnerRERANUmber(channelPartner.RERANumber ?? "");
    });

  }, [listState.channelPartnerMobileNumber]);

  const loadSourcingDetails = async () => {

    await runApiWithLoader(

      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationChannelPartnerSourcingRequest = {
          PageNumber: 1,
          PageSize: 1,
          ChannelPartnerId: listState.channelPartnerId || undefined,
          ProjectId: projectId || undefined,
        };

        const response = await ChannelPartnerSourcingService.apiCallPullChannelPartnerSourcing(params);

        if (E.isRight(response)) {

          setSourcingData(response.right.Data?.[0] || null);
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
      "Loading Channel Partner Sourcing"
    );
  };

  const handleBackToList = () => {
    navigate("/sourcing");
  };

  const handleEdit = () => {
    if (!sourcingData?.ChannelPartnerSourcingId) return;
    navigate(`/sourcing/add`);
  };



  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <HeaderActionBar
        titleText="Channel Partner Sourcing : "
        subTitleText={listState.channelPartnerName || ""}
        cancelText="Back"
        EditText="Edit"
        onCancel={handleBackToList}
        canAction={canAction}
        onEdit={handleEdit}
        isLoading={false}
      />

      <div className="grid grid-cols-12 gap-4 pt-5">
        <div className="col-span-5">
          <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">
            <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4">
              <FieldItem label="Full Name" value={channelPartnerFullName || '-'} />
              <FieldItem label="Company Name" value={channelPartnerCompanyName || '-'} />
              <FieldItem label="Firms Type" value={channelPartnerFirmsType || '-'} />
              <FieldItem label="PAN Number" value={channelPartnerPanNumber || '-'} />
              <FieldItem label="Aadhaar Card Number" value={channelPartnerAadhaarCardNumber || '-'} />
              <FieldItem label="RERA Number" value={channelPartnerRERANUmber || '-'} />
            </div>
          </div>
        </div>

        <div className="col-span-7">
          <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">
            <div className="mt-2 pb-2 border-b-2 border-gray-300">
              <h1 className="text-gray-500 font-medium text-sm">
                Channel Partner Sourcing Details
              </h1>
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-700">

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewChannelPartnerSourcing;


