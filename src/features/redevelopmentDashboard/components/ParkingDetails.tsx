import React from "react";


interface Props {
  parkingData: any[];
}

const ParkingDetails: React.FC<Props> = ({ parkingData }) => {

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 h-[387px]">
      <h3 className="text-sm text-gray-500 font-medium mb-3">
        Parking
      </h3>

      <div className="space-y-4">
        {/* Sales Parking */}
        <div className="rounded-2xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-blue-600">
            Sales Parking
          </p>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {parkingData[0].SalesParking}
          </p>
        </div>

        {/* Member Parking */}
        <div className="rounded-2xl border border-gray-200 p-4">
          <p className="text-sm font-semibold  text-green-600">
            Member Parking
          </p>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {parkingData[0].MemberParking}
          </p>
        </div>

        {/* Visitors Parking */}
        <div className="rounded-2xl border border-gray-200 p-4">
          <p className="text-sm font-semibold  text-amber-600">
            Visitors Parking
          </p>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {parkingData[0].VisitorsParking}
          </p>
        </div>

        
      </div>
    </div>
  );
};

export default ParkingDetails;