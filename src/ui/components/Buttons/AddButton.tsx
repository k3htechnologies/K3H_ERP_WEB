import { Plus } from "lucide-react"

export const AddButton = () => {
    return <div className="flex gap-2 justify-center items-center w-[120px] h-[36px] bg-gradient-to-r from-[#135BEC] to-[#121258] rounded-[6px]">
        <Plus color="white" size={16}></Plus>
        <span className="text-white font-medium">Add</span>
    </div>
}