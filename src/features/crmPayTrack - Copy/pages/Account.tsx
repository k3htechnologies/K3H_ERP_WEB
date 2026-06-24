import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import PaymentSchedule from "@/features/crmPayTrack/components/PaymentSchedule";
import PaymentLedger from "@/features/crmPayTrack/components/PaymentLedger";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

export const Account: React.FC = () => {

    const { canView: canPaymentLedgerView } = useMenuPermissions('/paymentLedger');

    const { canView: canPaymentScheduleView } = useMenuPermissions('/paymentSchedule');

    const AccountTabList: { id: string; label: string }[] = [
        
        canPaymentScheduleView ? { id: 'PaymentSchedule', label: 'Payment Schedule' } : null,

        canPaymentLedgerView ? { id: 'PaymentLedger', label: 'Payment Ledger' } : null

    ].filter(Boolean) as { id: string; label: string }[];


    const [activeTab, setActiveTab] = useState<string>(AccountTabList?.[0]?.id ?? '');

    return (
        <div>

            <div className="pt-5">
                <Tabs
                    tabs={AccountTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            <div className="pt-5">
                {activeTab === "PaymentSchedule" && <PaymentSchedule />}
                {activeTab === "PaymentLedger" && <PaymentLedger />}
            </div>

        </div>
    )
}

export default Account