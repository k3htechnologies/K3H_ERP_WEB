import {  Upload } from "lucide-react"

export const ExportButton = () => {
    return <div className="flex gap-2 justify-center items-center w-[120px] h-[36px] bg-gradient-to-r from-[#0BB4FD] to-[#135BEC] rounded-[6px]">
        <Upload color="white" size={16}></Upload>
        <span className="text-white font-medium">Export</span>
    </div>
}