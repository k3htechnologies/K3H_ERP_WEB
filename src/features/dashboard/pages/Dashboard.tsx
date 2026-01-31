import React from "react";
import AttendancePunch from "../components/AttendancePunch";

const Dashboard: React.FC = () => {

  return (
   <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-6">

       <div className="grid grid-cols-12 gap-4">
        
            <div className="col-span-4">
              <AttendancePunch />
            </div>

            <div className="col-span-4">
             
            </div>
          </div>
        
    </div>
  );
};

export default Dashboard;
