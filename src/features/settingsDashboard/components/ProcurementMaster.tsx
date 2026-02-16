const ProcurementMaster: React.FC = () => {
  const data = [
    // {
    //   title: "Material",
    //   value: 48,
    // },
    // {
    //   title: "Sub-Material",
    //   value: 132,
    // },
    // {
    //   title: "UOM",
    //   value: 10,
    // },
    {
      title: "Material",
      value: "-",
    },
    {
      title: "Sub-Material",
      value: "-",
    },
    {
      title: "UOM",
      value: "-",
    },
  ];

  return (
    <div className="space-y-3 pt-4">
      <h1 className="font-semibold text-gray-800">Procurement Master</h1>
      <div className="w-full bg-white p-4 border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-md">
        {data.map((c, i) => {
          return (
            <div key={i}>
              <p className="text-sm text-gray-500 font-medium">{c.title}</p>
              <p className="text-lg font-semibold text-gray-900">{c.value}</p>
            </div>
          );
        })}
      </div>

      <div>
        <div className="w-full bg-yellow-50 p-4 border border-yellow-200 shadow-sm rounded-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Pending Material Setup</p>
            {/* <p className="text-xs text-gray-600 mt-1">Requires Configuration</p> */}
            <p className="text-xs text-gray-600 mt-1">-</p>
          </div>
          <p className="text-right text-amber-600 font-extrabold text-2xl mr-5">-</p>
        </div>
      </div>
    </div>
  );
};

export default ProcurementMaster;
