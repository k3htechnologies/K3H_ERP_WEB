import { useState } from "react";

const CrmMilestoneView: React.FC = () => {

    const [active, setActive] = useState<"Agreement" | "GST" | "TDS">("Agreement");

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-800">Collection Summary</h2>

            {/* ================= TOP CARDS ================= */}
            <div className="grid grid-cols-4 gap-3 mt-4">

                <div className="bg-[#0F2A44] text-white p-5 rounded-lg">
                    <p className="text-sm">Total Collection</p>
                    <p className="font-semibold">₹ 1.52 Cr</p>
                </div>

                <div className="bg-gray-100 p-5 rounded-lg">
                    <p className="text-sm text-gray-600">Agreement</p>
                    <p className="font-semibold">₹ 1.25 Cr</p>
                </div>

                <div className="bg-gray-100 p-5 rounded-lg">
                    <p className="text-sm text-gray-600">GST</p>
                    <p className="font-semibold">₹ 9.36 Cr</p>
                </div>

                <div className="bg-gray-100 p-5 rounded-lg">
                    <p className="text-sm text-gray-600">TDS</p>
                    <p className="font-semibold">₹ 6.30 Cr</p>
                </div>

            </div>
            <div className="flex justify-between items-center mt-4 bg-white p-3 rounded-lg mt-4 border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

                <p className="text-sm text-gray-600 ">
                    Collection Trend
                </p>

                <div className="flex bg-gray-100 rounded-lg p-1">
                    {["Agreement", "GST", "TDS"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setActive(t as any)}
                            className={`px-3 py-1 text-sm rounded-md ${active === t
                                ? "bg-blue-600 text-white"
                                : "text-gray-600"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white p-3 rounded-lg mt-4 border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>


            </div>

        </div>
    );

};

export default CrmMilestoneView;