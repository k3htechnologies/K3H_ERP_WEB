import NoDataView from "@/ui/components/NoDataView/NoDataView";

interface Props {
    uploadedDocumentData: any[];
}

export default function UploadedDocument({ uploadedDocumentData = [] }: Props) {
    return (
        <div className="space-y-3 pt-2">

            <div className="pt-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Recently Uploaded Documents
                </h2>

                <div className="bg-white rounded-lg shadow-sm space-y-4 p-4 h-[385px] flex flex-col">
                    {uploadedDocumentData.length === 0 ? (
                        <div className="flex flex-col justify-center pt-8 items-center h-[200px]">
                            <NoDataView />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto thin-scroll space-y-3 pr-1">
                            {uploadedDocumentData.map((item, index) => (
                                <div key={index}
                                    className="mb-1 p-3 border-b border-gray-300 last:border-b-0 last:pb-0"
                                >
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600">Case No: {item.CaseNumber}</p>
                                        <p className="text-sm font-medium">{item.DocumentName}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}