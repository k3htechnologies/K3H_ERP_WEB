import { Download } from "lucide-react"

export const ImportButton = () => {
    return <div className="flex gap-2 justify-center items-center w-[120px] h-[36px] bg-gradient-to-r from-[#00A800] to-[#36E777] rounded-[6px]">
        <Download color="white" size={16}></Download>
        <span className="text-white font-medium">Import</span>
    </div>
}