interface BankGuranteeTabProps {
    projectId: number | null;
    buildingId: number;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    setLoadingMessage: (loadingMessage: string) => void;
}

export const BankGuaranteeTab: React.FC<BankGuranteeTabProps> = ({
    // projectId,
    // buildingId,
    // isLoading,
    // setIsLoading,
    // setLoadingMessage,

}) => {
    return (
        <div>
            <h1>Bank Gurantee</h1>
        </div>
    )
}