import { Calendar1Icon, Clock1, LaptopIcon, ListTodo, DollarSignIcon, FileDown } from "lucide-react"

export default function QuickActions() {

    // Enter 6 data and display on the cards
    const cardDarta = [
        {
            icon: <Calendar1Icon size={24} />,
            title: "Apply Leave",
            bg: "bg-blue-100",
            text: "text-blue-600"

        },
        {
            icon: <Clock1 size={24} />,
            title: "Regularize",
            bg: "bg-green-100",
            text: "text-green-600"

        },
        {
            icon: <ListTodo size={24} />,
            title: "Raise Task",
            bg: "bg-purple-100",
            text: "text-purple-600"

        },
        {
            icon: <LaptopIcon size={24} />,
            title: "Request Asset",
            bg: "bg-orange-100",
            text: "text-orange-600"

        },
        {
            icon: <DollarSignIcon size={24} />,
            title: "Apply Advance",
            bg: "bg-yellow-100",
            text: "text-yellow-600"

        },
        {
            icon: <FileDown size={24} />,
            title: "Payslip",
            bg: "bg-pink-100",
            text: "text-pink-600"

        }
    ]

    return (
        <div className="space-y-3 pt-5">
            <div className="bg-white rounded-xl shadow p-4 h-full mt-9">
                <p className="text-sm font-semibold text-gray-500">Quick Actions</p>
                <div className="grid grid-cols-2 ">
                    {cardDarta.map((card, index) => (
                        <div key={index} className=" w-40 h-40 border border-gray-200 rounded-lg p-3 mt-3 cursor-pointer flex flex-col items-center justify-center hover:shadow-lg transition-shadow">
                            <div className={`p-2 rounded-md ${card.bg} ${card.text}`}>
                                {card.icon}
                            </div>


                            <p className="text-center mt-2">{card.title}</p>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    )
}