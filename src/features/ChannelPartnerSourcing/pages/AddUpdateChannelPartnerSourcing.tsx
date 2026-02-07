import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import { TextArea } from "@/ui/components/forms/Textarea";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { Loader } from "@/core/utils/loader";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import type {
  AddUpdateChannelPartnerSourcingRequest,
  ChannelPartnerSourcingData,
  FilterWithPaginationChannelPartnerSourcingRequest
} from "../models/ChannelPartnerSourcingModel";
import { ChannelPartnerSourcingService } from "../services/ChannelPartnerSourcingService";
import { fetchChannelPartnerByMobileNumber } from "@/features/ChannelPartner/channelPartnerDropDown";
import { Search } from "lucide-react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import RadioPill from "@/ui/components/forms/RadioPill";

const createInitialFormState = (): AddUpdateChannelPartnerSourcingRequest => ({
  ChannelPartnerSourcingId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  ChannelPartnerId: 0,
  SourcingRemark: "",
  IBM_OBM: "0"
});

export const AddUpdateChannelPartnerSourcing: React.FC = () => {

  const navigate = useNavigate();
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions("/sourcing");

  const { ChannelPartnerSourcingId } = useParams<{ ChannelPartnerSourcingId?: string }>();
  const sourcingIdParam = ChannelPartnerSourcingId ? Number(ChannelPartnerSourcingId) : 0;
  const isAddMode = sourcingIdParam === 0;

  const [formData, setFormData] = useState<AddUpdateChannelPartnerSourcingRequest>(() => createInitialFormState());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [channelPartnerSearchByMobileNumber, setChannelPartnerSearchByMobileNumber] = useState<string>();
  const [channelPartnerId, setChannelPartnerId] = useState<number>();
  
  //SET CHANNEL PARTNER DETAILS

  const [channelPartnerFullName, setChannelPartnerFullName] = useState<string>();
  const [channelPartnerCompanyName, setChannelPartnerCompanyName] = useState<string>();
  const [channelPartnerFirmsType, setChannelPartnerFirmsType] = useState<string>();
  const [channelPartnerPanNumber, setChannelPartnerPanNumber] = useState<string>();
  const [channelPartnerAadhaarCardNumber, setChannelPartnerAadhaarCardNumber] = useState<string>();
  const [channelPartnerRERANUmber, setChannelPartnerRERANUmber] = useState<string>();

  const [ibmobm, setIbmObm] = useState<string>("IBM");

  useEffect(() => {

    if (!isAddMode) {

      fetchChannelPartnerSourcingDetails();

    }
  }, [ChannelPartnerSourcingId]);

  const fetchChannelPartnerSourcingDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationChannelPartnerSourcingRequest = {
          PageNumber: 1,
          PageSize: 1,
          ChannelPartnerSourcingId: sourcingIdParam
        };

        const response = await ChannelPartnerSourcingService.apiCallPullChannelPartnerSourcing(params);

        if (E.isRight(response)) {

          const data: ChannelPartnerSourcingData | null = response.right.Data?.[0] || null;

          if (data) {

            setFormData(prev => ({
              ...prev,
              ChannelPartnerSourcingId: data.ChannelPartnerSourcingId ?? prev.ChannelPartnerSourcingId,
              Uniquekey: data.Uniquekey ?? prev.Uniquekey,
              ChannelPartnerId: data.ChannelPartnerId ?? prev.ChannelPartnerId,
              SourcingRemark: data.SourcingRemark ?? prev.SourcingRemark,
            }));

            setChannelPartnerSearchByMobileNumber(data.MobileNumber ? data.MobileNumber.toString() : '');
          }

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
      "Loading Sourcing"
    );
  };

  const handleFieldChange = (field: keyof AddUpdateChannelPartnerSourcingRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [k: string]: string } = {};

    if (channelPartnerId === 0 || channelPartnerId === undefined) {
      newErrors.ChannelPartnerId = "Channel Partner is required";
    }
    if (!formData.SourcingRemark) {
      newErrors.SourcingRemark = "Sourcing Remark is required";
    }
    setErrors(newErrors);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const handleSave = async () => {
    const { isValid } = validateForm();
    if (!isValid) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload: AddUpdateChannelPartnerSourcingRequest = {
          ChannelPartnerSourcingId: formData.ChannelPartnerSourcingId ?? 0,
          Uniquekey: formData.Uniquekey ?? "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          ChannelPartnerId: channelPartnerId ?? 0,
          SourcingRemark: formData.SourcingRemark?.trim() ?? ""
        };

        const response =
          await ChannelPartnerSourcingService.apiCallAddUpdateChannelPartnerSourcing(payload);

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

          navigate("/sourcing");

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
      isAddMode ? "Adding Sourcing" : "Updating  Sourcing"
    );
  };

  const handleCancel = () => {
    navigate("/sourcing");
  };

  //#region HANDLE SEARCH CHANGE EVENT CHANNEL PARTNER

  const handleSearchByChannelPartner = (searchValue: string) => {
    setChannelPartnerSearchByMobileNumber(searchValue);
  };

  const clearChannelPartnerDetails = () => {
    setChannelPartnerFullName("");
    setChannelPartnerCompanyName("");
    setChannelPartnerFirmsType("");
    setChannelPartnerPanNumber("");
    setChannelPartnerAadhaarCardNumber("");
    setChannelPartnerRERANUmber("");
    setChannelPartnerId(0);
  };


  useEffect(() => {
    const mobile = channelPartnerSearchByMobileNumber?.trim() || "";

    if (mobile.length !== 10) {
      clearChannelPartnerDetails();
      return;
    }

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

  }, [channelPartnerSearchByMobileNumber]);


  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <h2 className="text-lg font-semibold mb-4">
        Channel Partner Sourcing
      </h2>

      <div>
        <div className="flex gap-3">
          <RadioPill
            name="Nationality"
            label="IBM"
            value={formData.IBM_OBM ?? ''}
            checked={ibmobm === "IBM"}
            onChange={() => {
              setIbmObm("IBM");
              handleFieldChange("IBM_OBM", "IBM");
            }}
          />

          <RadioPill
            name="Nationality"
            label="OBM"
            value={formData.IBM_OBM ?? ''}
            checked={ibmobm === "OBM"}
            onChange={() => {
              setIbmObm("OBM");
              handleFieldChange("IBM_OBM", "OBM");
            }}

          />
        </div>
      </div>

      <div className="mt-4">
        <Input
          type="text"
          label="Channel Partner"
          value={channelPartnerSearchByMobileNumber}
          maxLength={10}
          onChange={(e) => {
            handleSearchByChannelPartner(e.target.value);
            setChannelPartnerSearchByMobileNumber(e.target.value);
          }}
          placeholder="Search By Mobile Number"
          leftIcon={<Search className="h-4 w-4 text-gray-400" />}

        />
      </div>
      {(channelPartnerSearchByMobileNumber?.length === 10 && channelPartnerSearchByMobileNumber != null) && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FieldItem label="Full Name" value={channelPartnerFullName || '-'} />
            <FieldItem label="Company Name" value={channelPartnerCompanyName || '-'} />
            <FieldItem label="Firms Type" value={channelPartnerFirmsType || '-'} />
            <FieldItem label="PAN Number" value={channelPartnerPanNumber || '-'} />
            <FieldItem label="Aadhaar Card Number" value={channelPartnerAadhaarCardNumber || '-'} />
            <FieldItem label="RERA Number" value={channelPartnerRERANUmber || '-'} />
          </div>
        </div>
      )}
      <div className="mt-4">

        <TextArea
          label="Sourcing Remark"
          required
          value={formData.SourcingRemark || ""}
          onChange={e => handleFieldChange("SourcingRemark", e.target.value)}
          placeholder="Enter Sourcing Remark"
          error={errors.SourcingRemark}
          rows={4}
        />
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={isAddMode ? "Add" : "Update"}
        onCancel={handleCancel}
        onSave={handleSave}
        canAction={canAction}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AddUpdateChannelPartnerSourcing;


