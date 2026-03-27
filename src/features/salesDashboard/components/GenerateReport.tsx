import { Button } from "@/ui/components/forms";
import { FileText } from "lucide-react";

export default function GenerateReport() {
    return (
        <div>
            <div className="bg-white w-full p-4 rounded-lg shadow-sm border border-gray-100 flex justify-end ">
                <Button color="blue" variant="solid" colorMode="extraLight" leftIcon={<FileText size={14} />}>
                    Generate Report
                </Button>
            </div>
        </div>
    )
}