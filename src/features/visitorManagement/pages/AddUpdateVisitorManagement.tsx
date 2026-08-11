import { Loader } from "@/core/utils/loader";
import { Input } from "@/ui/components/forms";
import { useState } from "react";
import type { AddUpdateVisitorManagementRequest, FilterWithPaginationVisitorsByMobileNoRequest } from "@/features/visitorManagement/models/VisitorManagementModel";
import { filterLetters } from "@/core/utils/fileValidation";
import MobileNumberInput from "@/ui/components/forms/MobileNumberInput";
import { runApiWithLoader } from "@/core/utils";

const initialFormState = (): AddUpdateVisitorManagementRequest => ({
    MobileNumber: "",
    VisitorName: "",
    EmployeeId: "",
    AppointmentDate: null,
    AppointmentTime: null,
    VisitorId: 0,
    Uniquekey: "",
    MobileNumberCountryCode: "+91"
})


const AddUpdateVisitorManagement: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [formData, setFormData] = useState<AddUpdateVisitorManagementRequest>(() => initialFormState());

    // ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    //#endregion

    const handleAddUpdateVisitorManagement = (e: React.FormEvent) => {
        e.preventDefault();
        // api to be called
        console.log('Add Update Visitor Management');
    };

    //#region HANDLE FIELD CHANGE EVENT
    const handleFieldChange = (field: keyof AddUpdateVisitorManagementRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

    // const fetchVisitorByMobileNoData = async (mobileNumber: string) => {
    //     await runApiWithLoader(
    //         setIsLoading,
    //         setLoadingMessage,
    //         async () => {
    //             const params: FilterWithPaginationVisitorsByMobileNoRequest = {
    //                 PageNumber: 1,
    //                 PageSize: 1,
    //                 MobileNumber: mobileNumber
    //             };

    //             const response = await inwardOutwardService.apiCallPullSenderReceiverByMobileNo(params);
    //             if (E.isRight(response)) {
    //                 const data = response.right.Data?.[0];

    //                 if (data) {
    //                     setFormData(prev => ({
    //                         ...prev,
    //                         ...(type === "sender" && {
    //                             SenderName: data.Name ?? "",
    //                             SenderEmailId: data.EmailId ?? "",
    //                             SenderAddress: data.Address ?? ""
    //                         }),
    //                         ...(type === "receiver" && {
    //                             ReceiverName: data.Name ?? "",
    //                             ReceiverEmailId: data.EmailId ?? "",
    //                             ReceiverAddress: data.Address ?? ""
    //                         })
    //                     }));
    //                 }
    //             } else {
    //                 addToast({ type: "error", title: response.left.message });
    //             }
    //             return response;
    //         },
    //         undefined,
    //         (error: any) => {
    //             addToast({ type: "error", title: error.message });
    //         },
    //         undefined,
    //         "Loading Data",
    //     );
    // };


    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}><div></div> </Loader>

            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll">
                <form onSubmit={handleAddUpdateVisitorManagement}>
                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Visitor's Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">

                            <div>
                                <MobileNumberInput
                                    label="Mobile No."
                                    mobileNumber={formData.MobileNumber ?? ''}
                                    countryCode={formData.MobileNumberCountryCode ?? "+91"}
                                    required
                                    onMobileChange={(value) => {
                                        handleFieldChange("MobileNumber", value);

                                        // fetchSenderReceiverByMobileNoData(value, "sender");
                                        setFormData(prev => ({
                                            ...prev,
                                            SenderName: "",
                                            SenderEmailId: "",
                                            SenderAddress: ""
                                        }));
                                    }}
                                    onCountryCodeChange={(value) =>
                                        handleFieldChange("MobileNumberCountryCode", value)
                                    }
                                    error={errors.MobileNumber}

                                />
                            </div>
                            <div>
                                <Input
                                    label="First Name"
                                    placeholder="Enter First Name"
                                    value={formData.VisitorName}
                                    required onChange={(e) => handleFieldChange("VisitorName", filterLetters(e.target.value))}
                                    error={errors.VisitorName}
                                />
                            </div>

                        </div>

                    </div>


                </form>

            </div>
        </div>
    );
};

export default AddUpdateVisitorManagement;