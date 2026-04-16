import React from "react";

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-stone-50">

            {/* Header */}
            <div className="bg-blue-900 text-white text-center px-4 py-6 sm:px-6 sm:py-10">

                <h1 className="text-2xl sm:text-4xl font-bold mb-2 leading-tight">
                    Privacy <span className="text-amber-400">Policy</span>
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
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">01</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Introduction</h1>
                    <p className="text-stone-500 text-sm leading-relaxed mb-2">
                        This Privacy Policy explains how H.Rishabraj Group ("we", "our", or "us") collects, uses,
                        discloses, and safeguards your information when you use our Real Estate ERP Application ("HRR ERP 2.0").
                    </p>
                    <p className="text-stone-500 text-sm leading-relaxed mb-3">
                        This App is intended for business use and includes modules such as Sales, CRM, Accounts,
                        Finance, HRMS, and Operations etc.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-800 rounded px-4 py-2 text-sm text-blue-900 font-medium">
                        By using the App, you agree to the collection and use of information in accordance with this policy.
                    </div>
                </section>

                {/* 2. Information We Collect */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">02</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-4">Information We Collect</h1>

                    <p className="text-sm font-semibold text-stone-700 mb-2">2.1 Personal Information</p>
                    <p className="text-stone-500 text-sm mb-2">We may collect:</p>
                    <ul className="space-y-2 mb-4">
                        {[
                            "Full name",
                            "Phone number",
                            "Email address",
                            "Employee details (HRMS module)",
                            "Customer and lead details (CRM/Sales module)",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="my-3 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

                    <p className="text-sm font-semibold text-stone-700 mb-2">2.2 Financial &amp; Business Data</p>
                    <ul className="space-y-2 mb-4">
                        {[
                            "Transaction and billing records",
                            "Payment and accounting data",
                            "Property and project-related information",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="my-3 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

                    <p className="text-sm font-semibold text-stone-700 mb-2">2.3 Device &amp; Technical Information</p>
                    <ul className="space-y-2 mb-4">
                        {[
                            "Device type and OS version",
                            "IP address",
                            "App usage data and logs",
                            "Crash reports and diagnostics",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="my-3 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

                    <p className="text-sm font-semibold text-stone-700 mb-2">2.4 Sensitive Information</p>
                    <p className="text-stone-500 text-sm mb-2">We do not collect sensitive personal data such as:</p>
                    <ul className="space-y-2">
                        {[
                            "Biometric data",
                            "Personal health data",
                            "Government IDs (unless explicitly required and disclosed)",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 3. How We Use Your Information */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">03</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">How We Use Your Information</h1>
                    <p className="text-stone-500 text-sm mb-3">We use the collected data to:</p>
                    <ul className="space-y-2">
                        {[
                            "Provide and manage ERP functionalities",
                            "Maintain sales, CRM, and operational workflows",
                            "Process financial transactions and generate reports",
                            "Manage HR and employee records",
                            "Improve app performance and user experience",
                            "Ensure security and prevent fraud",
                            "Comply with legal obligations",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 4. Legal Basis for Processing */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">04</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-1">Legal Basis for Processing</h1>
                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-3">(GDPR Compliance)</p>
                    <p className="text-stone-500 text-sm mb-3">
                        If you are located in applicable regions, we process data based on:
                    </p>
                    <ul className="space-y-2">
                        {[
                            "Contractual necessity – to provide ERP services",
                            "Legitimate interests – system improvement and security",
                            "Legal obligations – compliance with applicable laws",
                            "Consent – where required (e.g., optional features)",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 5. Data Sharing & Disclosure */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">05</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Data Sharing &amp; Disclosure</h1>
                    <div className="bg-blue-50 border-l-4 border-blue-800 rounded px-4 py-2 text-sm text-blue-900 font-medium mb-3">
                        We do <strong>not</strong> sell personal data.
                    </div>
                    <p className="text-stone-500 text-sm mb-3">We may share data:</p>
                    <ul className="space-y-2 mb-3">
                        {[
                            "Within your organization (authorized users only)",
                            "With trusted service providers (cloud hosting, analytics)",
                            "With payment gateways (if applicable)",
                            "When required by law or government authorities",
                            "To protect legal rights and prevent fraud",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-stone-500 text-sm">
                        All third-party partners are bound by confidentiality obligations.
                    </p>
                </section>

                {/* 6. How We Share Your Information */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">06</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">How We Share Your Information</h1>
                    <p className="text-stone-500 text-sm mb-4">
                        We may share your information with third parties under the following circumstances:
                    </p>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-stone-700 mb-1">Service Providers</p>
                            <p className="text-stone-500 text-sm leading-relaxed">
                                We may engage third-party service providers to assist us in delivering our Service or
                                performing related tasks. These service providers are contractually obligated to protect
                                your information and only use it for the purposes specified by us.
                            </p>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
                        <div>
                            <p className="text-sm font-semibold text-stone-700 mb-1">Business Partners</p>
                            <p className="text-stone-500 text-sm leading-relaxed">
                                We may share your information with trusted business partners or affiliates for marketing,
                                advertising, or other legitimate business purposes. However, we will obtain your consent
                                before sharing your personal information for such purposes.
                            </p>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
                        <div>
                            <p className="text-sm font-semibold text-stone-700 mb-1">Legal Compliance</p>
                            <p className="text-stone-500 text-sm leading-relaxed">
                                We may disclose your information to comply with applicable laws, regulations, legal
                                processes, or governmental requests.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 7. Data Security */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">07</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Data Security</h1>
                    <p className="text-stone-500 text-sm mb-3">We implement industry-standard security measures:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {[
                            "Role-based access control (RBAC)",
                            "Encrypted data transmission (HTTPS/SSL)",
                            "Secure authentication systems",
                            "Regular backups and monitoring",
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm text-stone-700">
                                <span>🔒</span>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-stone-400 text-xs">However, no system is 100% secure.</p>
                </section>

                {/* 8. Data Retention */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">08</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Data Retention</h1>
                    <p className="text-stone-500 text-sm mb-3">We retain data:</p>
                    <ul className="space-y-2">
                        {[
                            "As long as your organization uses the App",
                            "As required by law (e.g., financial records)",
                            "Until deletion is requested (subject to legal obligations)",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 9. User Rights */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">09</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">User Rights</h1>
                    <p className="text-stone-500 text-sm mb-3">
                        Under applicable laws (including GDPR and Indian IT Rules), users have rights to:
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {[
                            "Access their data",
                            "Correct inaccurate data",
                            "Request deletion",
                            "Restrict processing",
                            "Data portability (where applicable)",
                        ].map((item) => (
                            <span key={item} className="bg-stone-50 border border-stone-200 rounded-full px-4 py-1 text-sm text-stone-500 font-medium">
                                {item}
                            </span>
                        ))}
                    </div>
                    <p className="text-stone-500 text-sm">
                        To exercise rights, contact us at the details below.
                    </p>
                </section>

                {/* 10. Children's Privacy */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">10</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Children's Privacy</h1>
                    <p className="text-stone-500 text-sm mb-3">
                        This App is not intended for children under 13 years of age.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-800 rounded px-4 py-2 text-sm text-blue-900 font-medium">
                        We do not knowingly collect data from children.
                    </div>
                </section>

                {/* 11. Permissions Used */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">11</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Permissions Used</h1>
                    <p className="text-stone-500 text-sm mb-3">The App may request the following permissions:</p>
                    <ul className="space-y-2 mb-3">
                        {[
                            "Internet access (for syncing data)",
                            "Storage access (for documents/uploads)",
                            "Camera (for document capture, if applicable)",
                            "Location access (for attendance tracking, punch-in/punch-out, and location-based services)"
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-stone-500 text-sm">Permissions are used strictly for App functionality.</p>
                </section>

                {/* 12. Cookies & Tracking */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">12</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Cookies &amp; Tracking</h1>
                    <p className="text-stone-500 text-sm mb-3">We may use:</p>
                    <ul className="space-y-2 mb-3">
                        {["Session cookies", "Analytics tools"].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-stone-500 text-sm">These help improve user experience and system performance.</p>
                </section>

                {/* 13. Third-Party Services */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">13</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Third-Party Services</h1>
                    <p className="text-stone-500 text-sm mb-3">The App may use third-party services such as:</p>
                    <ul className="space-y-2 mb-3">
                        {["Cloud hosting providers", "Analytics tools", "Payment gateways"].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-stone-500 text-sm">
                        We are not responsible for their independent privacy practices.
                    </p>
                </section>

                {/* 14. Compliance with Indian Laws */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">14</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Compliance with Indian Laws</h1>
                    <p className="text-stone-500 text-sm mb-3">This policy complies with:</p>
                    <ul className="space-y-2">
                        {[
                            "Information Technology Act, 2000",
                            "IT (Reasonable Security Practices and Procedures) Rules, 2011",
                            "Applicable data protection guidelines in India",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 15. International Data Transfers */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">15</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">International Data Transfers</h1>
                    <p className="text-stone-500 text-sm leading-relaxed">
                        If data is stored or processed outside India, we ensure appropriate safeguards are in place to
                        protect your information.
                    </p>
                </section>

                {/* 16. Changes to This Policy */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">16</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Changes to This Policy</h1>
                    <p className="text-stone-500 text-sm mb-3">
                        We may update this Privacy Policy periodically. Updates will be:
                    </p>
                    <ul className="space-y-2">
                        {[
                            "Posted in the App",
                            "Notified via email or system notification (if required)",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 17. Contact Us & Consent */}
                <section className="p-2">
                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">17</p>
                    <h1 className="text-xl font-bold text-stone-800 mb-3">Contact Us</h1>
                    <p className="text-stone-500 text-sm leading-relaxed mb-4">
                        If you have any questions, concerns, or complaints about this Privacy Policy or our data
                        practices, please contact us by raising a ticket navigating through help and support.
                    </p>

                    <div className="my-3 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

                    <p className="text-xs font-medium tracking-widest text-amber-500 uppercase mb-2">Consent</p>
                    <p className="text-stone-500 text-sm mb-3">By using this App, you:</p>
                    <ul className="space-y-2 mb-4">
                        {[
                            "Agree to this Privacy Policy",
                            "Consent to data collection and usage as described",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-stone-500 text-sm">
                                <span className="text-blue-800 font-bold mt-0.5 shrink-0">.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded px-4 py-3 text-sm text-amber-800 font-medium">
                        This Privacy Policy may require customization based on your specific requirements.
                        It's advisable to consult with legal professionals to ensure compliance with applicable
                        privacy laws and regulations.
                    </div>
                </section>

            </div>

            {/* Footer */}
            <footer className="bg-blue-900 text-center py-2 px-2 text-xs text-white/40 leading-loose">
                <p><strong className="text-white/80">HRR ERP 2.0</strong> · H.Rishabraj Group</p>
                <p>All rights reserved.</p>
            </footer>

        </div>
    );
};

export default PrivacyPolicy;
