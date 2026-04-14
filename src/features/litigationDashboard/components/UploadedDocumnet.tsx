import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table6 } from "@/features/litigationDashboard/models/litigationDashboardModel";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";

interface Props {
    uploadedDocumentData: Table6[];
}

function getDocumentInfo(item: Table6) {
    if (item.ClosureAttachementURL) {
        return { urls: item.ClosureAttachementURL.split(","), title: "Closure Document" };
    }
    if (item.HearingAttachementURL) {
        return { urls: item.HearingAttachementURL.split(","), title: "Hearing Document" };
    }
    if (item.DocumentURL) {
        return { urls: item.DocumentURL.split(","), title: "Litigation Document" };
    }
    return { urls: [], title: "No Document" };
}

export default function UploadedDocument({ uploadedDocumentData }: Props) {
    return (
        <div className="space-y-3 pt-2">
            <div className="pt-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Recently Uploaded Documents
                </h2>

                <div className="bg-white rounded-lg shadow-sm space-y-4 p-4 h-[385px] flex flex-col">
                    {uploadedDocumentData.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-[200px]">
                            <NoDataView />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto thin-scroll space-y-3 pr-1">
                            {uploadedDocumentData.map((item) => {
                                const { urls, title } = getDocumentInfo(item);
                                return (
                                    <div
                                        key={item.CaseNumber}
                                        className="mb-1 p-3 border-b border-gray-300 last:border-b-0 last:pb-0"
                                    >
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">
                                                Document Name : {item.DocumentName || "-"}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Case Number : {item.CaseNumber ?? ''}
                                            </p>
                                            {urls.length > 0 ? (
                                                <MultiImageViewer
                                                    images={urls}
                                                    title={title}
                                                    triggerLabel="Document"
                                                />
                                            ) : (
                                                <span className="text-gray-400 text-sm">No Document</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}