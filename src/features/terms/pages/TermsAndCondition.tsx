import React from "react";

const Terms: React.FC = () => {
    return (
        <div className="min-h-screen bg-stone-50">

            {/* Header */}
            {/* Header */}
            <div className="bg-blue-900 text-white text-center px-4 py-6 sm:px-6 sm:py-10">

                <h1 className="text-2xl sm:text-4xl font-bold mb-2 leading-tight">
                    Terms & <span className="text-amber-400">Conditions</span>
                </h1>
                <p className="text-xs sm:text-sm text-white/70 mt-1">
                    HRR ERP 2.0 · H.Rishabraj Group
                </p>
                <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-2 sm:gap-6">
                    <span className="text-xs text-white/60">
                        Effective: <strong className="text-white">17 March 2026</strong>
                    </span>
                    <span className="text-xs text-white/60">
                        Application: <strong className="text-white">HRR ERP 2.0</strong>
                    </span>
                    <span className="text-xs text-white/60">
                        Company: <strong className="text-white">H.Rishabraj Group</strong>
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto px-4 py-10 pb-20 space-y-5">

                {/* 1. Introduction */}
                <section className=" p-2 ">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">01</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Introduction</h1>
                    <p className="text-stone-500 text-sm leading-relaxed">
                        These Terms &amp; Conditions ("Terms") govern your access to and use of the Real Estate ERP
                        Application ("App") provided by H.Rishabraj Group ("we", "our", "us").
                        By accessing or using the App, you agree to be bound by these Terms. If you do not agree,
                        please do not use the App.
                    </p>
                </section>

                {/* 2. Nature of Service */}
                <section className="p-2 ">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">02</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Nature of Service</h1>
                    <p className="text-stone-500 text-sm leading-relaxed mb-3">
                        The App is a business management platform designed for the real estate industry and includes
                        modules such as:
                    </p>
                    <ul className="space-y-2 mb-4">
                        {[
                            "Sales Management",
                            "Customer Relationship Management (CRM)",
                            "Accounts & Finance",
                            "Human Resource Management System (HRMS)",
                            "Operations & Project Management",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">›</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="bg-blue-50 border-l-4 border-blue-800 rounded px-4 py-2 text-sm text-blue-900 font-medium">
                        The App is intended for organizational and commercial use only.
                    </div>
                </section>

                {/* 3. User Accounts & Access */}
                <section className=" p-2 ">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">03</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">User Accounts &amp; Access</h1>
                    <ul className="space-y-2 mb-4">
                        {[
                            "Users must be authorized by their organization to access the App.",
                            "You are responsible for maintaining the confidentiality of login credentials.",
                            "You agree to provide accurate and up-to-date information.",
                            "Unauthorized access or sharing of credentials is strictly prohibited.",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded px-4 py-2 text-sm text-amber-800 font-medium">
                        We reserve the right to suspend or terminate accounts for misuse.
                    </div>
                </section>

                {/* 4. Use of the Application */}
                <section className=" p-2 ">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">04</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Use of the Application</h1>
                    <p className="text-stone-500 text-sm leading-relaxed mb-3">
                        You agree to use the App only for lawful purposes and in accordance with these Terms.
                    </p>
                    <p className="text-sm font-semibold text-red-700 mb-2">You shall NOT:</p>
                    <ul className="space-y-2">
                        {[
                            "Use the App for fraudulent or illegal activities",
                            "Attempt to gain unauthorized access to the system",
                            "Interfere with system security or performance",
                            "Upload malicious software or harmful data",
                            "Misuse customer or employee data",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-red-700 text-sm">
                                <span className="text-red-500 font-bold mt-1 text-xs shrink-0">✕</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 5. Data Ownership */}
                <section className=" p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">05</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Data Ownership</h1>
                    <ul className="space-y-2">
                        {[
                            "All business data entered into the App remains the property of the respective organization.",
                            "We act as a data processor and do not claim ownership of your data.",
                            "You are responsible for ensuring that the data you upload complies with applicable laws.",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 6. Data Security & Backup */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">06</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Data Security &amp; Backup</h1>
                    <ul className="space-y-2">
                        {[
                            "We implement reasonable security measures to protect your data.",
                            "Regular backups may be performed; however, users are advised to maintain their own backups where necessary.",
                            "We are not liable for data loss due to unforeseen technical issues beyond our control.",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 7. Intellectual Property */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">07</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Intellectual Property</h1>
                    <ul className="space-y-2">
                        {[
                            "The App, including its software, design, and content, is owned by H.Rishabraj Group.",
                            "Users are granted a limited, non-exclusive, non-transferable license to use the App.",
                            "You may not copy, modify, distribute, or reverse engineer any part of the App.",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 8. Third-Party Integrations */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">08</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Third-Party Integrations</h1>
                    <p className="text-stone-500 text-sm leading-relaxed mb-3">
                        The App may integrate with third-party services (e.g., payment gateways, analytics tools).
                    </p>
                    <ul className="space-y-2">
                        {[
                            "Use of such services is subject to their respective terms and policies.",
                            "We are not responsible for third-party services or their performance.",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 9. Limitation of Liability */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">09</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Limitation of Liability</h1>
                    <p className="text-stone-500 text-sm leading-relaxed mb-3">
                        To the maximum extent permitted by law:
                    </p>
                    <ul className="space-y-2">
                        {[
                            "We shall not be liable for indirect, incidental, or consequential damages",
                            "We are not responsible for business losses, data loss, or service interruptions",
                            "Our total liability shall not exceed the amount paid by you for the service (if applicable)",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 10. Indemnification */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">10</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Indemnification</h1>
                    <p className="text-stone-500 text-sm leading-relaxed mb-3">
                        You agree to indemnify and hold harmless H.Rishabraj Group from:
                    </p>
                    <ul className="space-y-2">
                        {[
                            "Any claims arising from misuse of the App",
                            "Violation of these Terms",
                            "Breach of applicable laws or third-party rights",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 11. Suspension & Termination */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">11</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Suspension &amp; Termination</h1>
                    <p className="text-stone-500 text-sm leading-relaxed mb-3">
                        We may suspend or terminate access:
                    </p>
                    <ul className="space-y-2 mb-4">
                        {[
                            "For violation of these Terms",
                            "For security concerns",
                            "For non-payment (if applicable)",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded px-4 py-2 text-sm text-amber-800 font-medium">
                        Upon termination, access to data may be restricted or deleted as per policy.
                    </div>
                </section>

                {/* 12. Confidentiality */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">12</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Confidentiality</h1>
                    <p className="text-stone-500 text-sm leading-relaxed mb-3">Users agree to:</p>
                    <ul className="space-y-2">
                        {[
                            "Maintain confidentiality of business data accessed through the App",
                            "Not disclose sensitive information without authorization",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 13. Compliance with Laws */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">13</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Compliance with Laws</h1>
                    <p className="text-stone-500 text-sm leading-relaxed mb-3">
                        Users must comply with all applicable laws, including:
                    </p>
                    <ul className="space-y-2">
                        {[
                            "Information Technology Act, 2000 (India)",
                            "Data protection and privacy regulations",
                            "Financial and taxation laws",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 14. Modifications to the Terms */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">14</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Modifications to the Terms</h1>
                    <p className="text-stone-500 text-sm leading-relaxed mb-3">
                        We may update these Terms at any time. Updated Terms will be:
                    </p>
                    <ul className="space-y-2 mb-4">
                        {[
                            "Posted within the App or website",
                            "Effective immediately unless otherwise stated",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="bg-blue-50 border-l-4 border-blue-800 rounded px-4 py-2 text-sm text-blue-900 font-medium">
                        Continued use of the App constitutes acceptance of updated Terms.
                    </div>
                </section>

                {/* 15. Governing Law & Jurisdiction */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">15</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Governing Law &amp; Jurisdiction</h1>
                    <p className="text-stone-500 text-sm leading-relaxed mb-3">
                        These Terms shall be governed by the laws of India.
                    </p>
                    <div className="bg-stone-900 text-white rounded-lg px-5 py-4 flex items-center gap-4">
                        <span className="text-3xl shrink-0">⚖️</span>
                        <div>
                            <p className="text-xs font-medium text-amber-400 mb-1 tracking-wide uppercase">Jurisdiction</p>
                            <p className="text-sm text-white/70">
                                Any disputes shall be subject to the jurisdiction of courts in{" "}
                                <strong className="text-white/90">Mumbai, Maharashtra</strong>.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 16. Force Majeure */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">16</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Force Majeure</h1>
                    <p className="text-stone-500 text-sm leading-relaxed mb-3">
                        We shall not be liable for failure or delay in performance due to events beyond our
                        control, including:
                    </p>
                    <ul className="space-y-2">
                        {[
                            "Natural disasters",
                            "Government actions",
                            "Network failures",
                            "Cyber incidents",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 17. Acceptance of Terms */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">17</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Acceptance of Terms</h1>
                    <div className="bg-blue-50 border-l-4 border-blue-800 rounded px-4 py-3 text-sm text-blue-900 font-medium">
                        By using this Application, you acknowledge that you have{" "}
                        <strong>read, understood, and agreed</strong> to these Terms &amp; Conditions.
                    </div>
                </section>

            </div>

            {/* Footer */}
            <footer className="bg-blue-900 text-center py-1 px-1 text-xs text-white/40 leading-loose">
                <p><strong className="text-white/80">HRR ERP 2.0</strong> · H.Rishabraj Group</p>
                <p> All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Terms;
