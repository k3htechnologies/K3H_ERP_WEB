export default function OverviewCards() {

    const cards = [
        {
            title: "Work Hours",
            time: " 4h 12m",
            task: "Running",
        },
        {
            title: "Work Hours",
            time: " 4h 12m",
            task: "Running",
        },
        {
            title: "Work Hours",
            time: " 4h 12m",
            task: "Running",
        },
        {
            title: "Work Hours",
            time: " 4h 12m",
            task: "Running",
        }
    ]


    return (
        <div className="space-y-3 pt-5">
            <h2 className="text-base font-semibold text-gray-800">Overview</h2>
            <div className="grid grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <div key={index} className="bg-white rounded-xl shadow p-5">
                        <p>{card.title}</p>
                        <p>{card.time}</p>
                        <p>{card.task}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}