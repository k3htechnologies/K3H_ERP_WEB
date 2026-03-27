import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table6 } from "@/features/litigationDashboard/models/litigationDashboardModel";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";

interface Props {
    uploadedDocumentData: Table6[];
}

function getDocumentInfo(item: Table6) {
    const docs = [];

    const hearing = parseDocumentUrls(item.HearingAttachementURL);
    if (hearing.length) {
        docs.push({ urls: hearing,
            title: "Hearing Document",
            count: hearing.length,
        });
    }

    const closure = parseDocumentUrls(item.ClosureAttachementURL);
    if (closure.length) {
        docs.push({
            urls: closure,
            title: "Closure Document",
            count: closure.length,
        });
    }

    const litigation = parseDocumentUrls(item.DocumentURL);
    if (litigation.length) {
        docs.push({
            urls: litigation,
            title: "Litigation Document",
            count: litigation.length,
        });
    }

    return docs;
}
export default function UploadedDocument({ uploadedDocumentData }: Props) {
    return (
        <div className="space-y-3 pt-2">
            <div className="pt-2.5">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Recently Uploaded Documents
                </h2>

                <div className="bg-white rounded-lg space-y-4 p-4 h-[384px] thin-scroll flex flex-col">

                    {uploadedDocumentData.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-[200px]">
                            <NoDataView />
                        </div>

                    ) : (

                        <div className="flex-1 overflow-y-auto thin-scroll space-y-3 pr-1">
                            {uploadedDocumentData.map((item) => {
                                const documents = getDocumentInfo(item);

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
                                            
                                            {documents.length > 0 ? (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {documents.map((doc, index) => (
                                                        <div
                                                            key={index}
                                                            className="inline-flex items-center px-2 py-2 border border-blue-500 text-blue-600 rounded text-sm font-medium hover:bg-blue-50 transition"
                                                        >
                                                            <p>{doc.title}</p>
                                                            <MultiImageViewer
                                                                images={doc.urls}
                                                                title={doc.title}
                                                                isIcon={false}
                                                                triggerLabel={`${doc.title} (${doc.count})`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
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
