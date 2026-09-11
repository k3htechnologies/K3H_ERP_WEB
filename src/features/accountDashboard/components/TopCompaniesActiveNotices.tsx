export default function TopCompaniesActiveNotices() {
    const companies = [
        { name: "Kampa Projects", notices: 8 },
        { name: "Hrishabraj", notices: 6 },
        { name: "Rishabraj Infra", notices: 5 },
        { name: "Lodha Empire", notices: 4 },
        { name: "Kampa Projects", notices: 8 },
        { name: "Rishabraj Infra", notices: 8 },
    ];

    const maxNotices = Math.max(...companies.map((c) => c.notices));

    return (
        <div className="space-y-3 pt-5">
            {/* Outer container: fixed height aur overflow-hidden */}
            <div className="bg-white rounded-xl p-4 h-[300px] border border-gray-100 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden">
                {/* Fixed Heading */}
                <h2 className="text-[14px] font-semibold text-gray-500 tracking-wide pb-3 pl-1 shrink-0">
                    TOP COMPANIES BY ACTIVE NOTICES
                </h2>

                {/* Scrollable Companies List */}
                <div className="flex flex-col gap-3 overflow-y-auto thin-scroll flex-1 pr-1">
                    {companies.map((company, index) => (
                        <div key={index}>
                            {/* Company name + count */}
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[14px] text-gray-700">
                                    {company.name}
                                </span>

                                <span className="text-[12px] font-medium text-blue-600">
                                    {company.notices} Active Notices
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-[7px] bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full"
                                    style={{
                                        width: `${(company.notices / maxNotices) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}