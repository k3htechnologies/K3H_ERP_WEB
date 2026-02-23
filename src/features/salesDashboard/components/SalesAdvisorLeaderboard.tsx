import React from 'react';

const Leaderboard = () => {
  const salesData = [
    { name: 'Rajesh Kumar', role: 'Sr. Sales Executive', bookings: '18/15', bookingValue: '₹2.1Cr', conversationRate: '90%' },
    { name: 'Priya Sharma', role: 'Sales Executive', bookings: '15/10', bookingValue: '₹1.6Cr', conversationRate: '75%' },
    { name: 'Amit Singh', role: 'Sales Executive', bookings: '12/8', bookingValue: '₹1.3Cr', conversationRate: '65%' },
    { name: 'Sneha Verma', role: 'Sr. Sales Executive', bookings: '10/7', bookingValue: '₹1.0Cr', conversationRate: '60%' },
  ]

  return (
    <div className="space-y-4 pt-5">
      <h2 className="text-lg font-semibold text-gray-800">Sales Advisor Leaderboard</h2>
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-gray-500 font-medium text-lg">Top Sales Advisor</h2>
        </div>

        {/* List */}
        <div className="flex flex-col">
          {salesData.map((advisor, index) => (
            <div
              key={index}
              className={`p-5 ${index !== salesData.length - 1 ? 'border-b border-gray-200' : ''}`}
            >
              <h3 className="text-gray-800 font-semibold text-base">{advisor.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{advisor.role}</p>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Bookings</p>
                  <p className="text-gray-900 font-bold">{advisor.bookings}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Booking Value</p>
                  <p className="text-gray-900 font-bold">{advisor.bookingValue}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Conversation Rate</p>
                  <p className="text-green-600 font-bold">{advisor.conversationRate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

  );
};

export default Leaderboard;