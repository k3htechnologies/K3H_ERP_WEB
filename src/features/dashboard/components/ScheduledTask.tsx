const ScheduledTask = () => {
    // const tasks = [
    //     { id: 1, title: "HR Dashboard Redesign", due: 'Today, 5:00 PM', status: "High" },
    //     { id: 2, title: "User Dshboard", due: 'Tomorrow, 10:00 AM', status: "Medium" },
    //     { id: 3, title: "Sales Dashboard", due: 'Tomorrow, 11:00 AM', status: "Medium" },
    // ]
    return (
        <div className="space-y-3 pt-5">
            <div className="bg-white rounded-xl shadow p-5 mt-4 h-92">
                <p className="text-base text-gray-500 mb-3 font-semibold">Scheduled Tasks</p>
                {/* Card 1 */}
                <div className="w-full bg-red-50  shadow-sm rounded-md p-2 border border-red-300 mt-2">
                    <p>HR Dashboard Redesign</p>
                    <div className="flex items-center justify-between">
                        <p>Today, 5:00 PM</p>
                        <p className="text-red-500 bg-red-100 px-2 py-1 rounded-md">High</p>
                    </div>

                </div>
                {/* Card 2 */}
                <div className="w-full bg-gray-100 shadow-sm rounded-md p-2 border border-gray-300 mt-2 ">
                    <p>User Dashboard</p>
                    <div className="flex items-center justify-between">
                        <p>Today, 5:00 PM</p>
                        <p>Medium</p>
                    </div>
                </div>
                {/* Card 3 */}
                <div className="w-full bg-gray-100 shadow-sm rounded-md p-2 border border-gray-300 mt-2 ">
                    <p>Sales Dashboard</p>
                    <div className="flex items-center justify-between">
                        <p>Today, 5:00 PM</p>
                        <p>Low</p>
                    </div>
                </div>
                <div className="w-full bg-gray-100 shadow-sm rounded-md p-2 border border-gray-300 mt-2 ">
                    <p>Sales Dashboard</p>
                    <div className="flex items-center justify-between">
                        <p>Today, 5:00 PM</p>
                        <p>Low</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ScheduledTask