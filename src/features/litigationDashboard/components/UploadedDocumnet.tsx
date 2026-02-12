
interface UploadedDocumentTableRecord {
    CaseNumber: string;
    DocumentName: string;
}

interface Props {
    uploadedDocumentData: UploadedDocumentTableRecord[];
}

export default function UploadedDocument({ uploadedDocumentData = [] }: Props) {
    return (
        <div className="space-y-3 pt-5">

            <div className="pt-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Recently Uploaded Documents
                </h2>

                <div className="bg-white rounded-xl p-4 h-[300px] " style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                    {uploadedDocumentData.map((item, index) => (
                        <div key={index}
                            className="mb-1 p-3 border-b border-gray-300 last:border-b-0 last:pb-0"
                        >
                            <div className="space-y-2">
                                <h1 className="font-medium">Structural Document</h1>
                                <p className="text-sm text-gray-600">Case No: {item.CaseNumber}</p>
                                <p className="text-sm font-medium">{item.DocumentName}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}