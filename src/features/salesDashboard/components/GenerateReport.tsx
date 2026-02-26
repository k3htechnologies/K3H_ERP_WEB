import { FileText } from "lucide-react";

export default function GenerateReport() {
    return (
        <div>
            <div className="bg-white w-full p-4 rounded-lg shadow-sm border border-gray-100 flex justify-end ">
                <button className="border border-blue-600 text-blue-600 text-sm px-4 py-2 rounded-lg hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                    onClick={() => {

                    }}>
                    <FileText size={14} />
                    <span>Generate Report</span>
                </button>
            </div>
        </div>
    )
}