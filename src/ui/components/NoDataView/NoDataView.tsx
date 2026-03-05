import React from "react";
import noData from '@/assets/images/noData.gif';

interface NoDataViewProps {
  message?: string;
  iconUrl?: string;
  className?: string;
  iconClassName?: string;
}

const NoDataView: React.FC<NoDataViewProps> = ({
  
  message = "No data found",
  iconUrl = noData,
  className = "",
  iconClassName = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <img
        src={iconUrl}
        alt="No Data"
        className={`w-32 h-32 opacity-80 ${iconClassName}`}
      />
      <p className="mt-4 text-gray-600 text-sm">{message}</p>
    </div>
  );
};

export default NoDataView;
