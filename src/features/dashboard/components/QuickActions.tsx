import { useState } from "react";
import { Calendar1Icon, Clock1, LaptopIcon, ListTodo, DollarSignIcon, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/ui/components/Modal/Modal";
import NoDataView from '@/ui/components/NoDataView/NoDataView';

export default function QuickActions() {

    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const cardDarta = [
        {
            icon: <Calendar1Icon size={24} />,
            title: "Apply Leave",
            bg: "bg-blue-100",
            text: "text-blue-600",
            onClick: () => navigate("/leave/add")


        },
        {
            icon: <Clock1 size={24} />,
            title: "Regularize",
            bg: "bg-green-100",
            text: "text-green-600",
            onClick: () => navigate("/attendance")

        },
        {
            icon: <ListTodo size={24} />,
            title: "Raise Task",
            bg: "bg-purple-100",
            text: "text-purple-600",
            onClick: () => setIsModalOpen(true)

        },
        {
            icon: <LaptopIcon size={24} />,
            title: "Request Asset",
            bg: "bg-orange-100",
            text: "text-orange-600",
            onClick: () => setIsModalOpen(true)

        },
        {
            icon: <DollarSignIcon size={24} />,
            title: "Apply Advance",
            bg: "bg-yellow-100",
            text: "text-yellow-600",
            onClick: () => setIsModalOpen(true)

        },
        {
            icon: <FileDown size={24} />,
            title: "Payslip",
            bg: "bg-pink-100",
            text: "text-pink-600",
            onClick: () => setIsModalOpen(true)

        }
    ]

    return (
        <div className="space-y-3 pt-5 sm:pt-7">
            <h1 className="text-base font-semibold opacity-0 select-none">
                Quick Actions
            </h1>

            <div className="bg-white rounded-xl p-4 sm:p-5 mt-3 flex flex-col 
                  min-h-[300px] sm:min-h-[400px] max-h-[70vh]">

                {/* Title */}
                <p className="text-sm sm:text-base font-semibold text-gray-800">
                    Quick Actions
                </p>

                {/* Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 sm:gap-4 mt-5 sm:mt-8 overflow-y-auto thin-scroll ">

                    {cardDarta?.length > 0 ? (
                        cardDarta.map((card, index) => (
                            <div
                                key={index}
                                onClick={card.onClick}
                                className="w-full aspect-square max-h-28 sm:max-h-32 
                       border border-gray-200 rounded-lg p-3 
                       cursor-pointer flex flex-col items-center justify-center 
                       hover:shadow-lg transition-all duration-200"
                            >
                                <div className={`p-2 sm:p-3 rounded-md ${card.bg} ${card.text}`}>
                                    {card.icon}
                                </div>

                                <p className="text-center mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-gray-700">
                                    {card.title ?? "-"}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex items-center justify-center py-10 text-center">
                            <NoDataView message="No data available" />
                        </div>
                    )}

                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Coming Soon"
                size="md"
            >
                <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                    <p className="text-gray-600 text-sm sm:text-lg">
                        This feature is currently under development and will be available soon.
                    </p>
                </div>
            </Modal>
        </div>
    )
}