import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
    MissingDetailsData: any[];
}

export default function MissingDetails({ MissingDetailsData = [] }: Props) {

    // USE NAVIGATE
    const navigate = useNavigate();

    //#region NAVIGATE TO  VIEW CHANNEL PARTNER
    const handleNavigateToView = useCallback(() => {
        navigate('/channelPartner/view');
    }, [navigate]);
    //#endregion

    //#region
    return (
        <div className="pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Missing Details
            </h2>

            <div className="bg-white rounded-lg p-4 space-y-4 shadow-sm h-[200px] overflow-y-auto thin-scroll">
                {MissingDetailsData.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full">
                        <NoDataView />
                    </div>
                ) : (
                    <div className="space-y-4 overflow-y-auto">
                        {MissingDetailsData.map((item, index) => (
                            <div key={index} className="flex items-stretch bg-red-50 rounded-lg overflow-hidden">

                                <div className="w-2 bg-red-500 flex-shrink-0"></div>
                                <div className="flex justify-between items-center w-full p-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {item.Name}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {item.SystemGeneratedCode}
                                        </p>
                                    </div>

                                    <button className="text-blue-600 text-sm font-medium underline hover:text-blue-800"
                                        onClick={() => {
                                            handleNavigateToView()
                                        }}
                                    >
                                        View
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}