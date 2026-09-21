export default function DisbursementOverview({ }) {
    return (
        <div className="space-y-3 pt-4 sm:pt-5">
            <div className="bg-white rounded-xl p-4 h-[300px] overflow-y-auto thin-scroll border border-gray-100 flex flex-col" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                <p className="text-sm font-semibold text-slate-500 uppercase p-1">
                    DISBURSMENT OVERVIEW
                </p>
                <div className="flex gap-5">
                    {/* Card 1 */}
                    <div className="bg-gray-100 w-48 rounded-xl p-3 mt-2">
                        <p className="text-gray-500 text-sm font-semibold">Sanctioned</p>
                        <p className="text-black font-semibold">₹1.23 Cr</p>
                    </div>
                    {/* Card-2 */}
                    <div className="bg-[#ECFEFF] w-48 rounded-xl p-3 mt-2">
                        <p className="text-[#06b6d4] text-sm font-semibold">Disbursed</p>
                        <p className="text-[#06b6d4] font-semibold">₹1.23 Cr</p>
                    </div>
                    {/* Card-3 */}
                    <div className="bg-[#fff7ed] w-48 rounded-xl p-3 mt-2">
                        <p className="text-[#f97316] text-sm font-semibold">Balance Limit</p>
                        <p className="text-[#f97316] font-semibold">₹11.70 Cr</p>
                    </div>
                </div>
                {/* Progress Bar Section */}
                <div className="mt-5 space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-slate-600">Disbursement Progress</span>
                        <span className="text-[#06b6d4]">9.5%</span>
                    </div>

                    {/* Track & Fill */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-[#06b6d4] h-full rounded-full transition-all duration-500"
                            style={{ width: "9.5%" }}
                        />
                    </div>
                </div>
                <div className="bg-[#ecfeff] rounded-xl w-full mt-8">
                    <p className="p-2 text-[#06b6d4] font-semibold text-sm">Latest: 31 Aug 2026 . HDFC Bank . ₹1.23 Cr (Gopal Darshan)</p>
                </div>
            </div>
        </div>
    )

}