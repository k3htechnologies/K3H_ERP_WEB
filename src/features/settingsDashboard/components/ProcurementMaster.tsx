
interface ProcurementMasterData {
  TotalMaterial: number;
  TotalSubMaterial: number;
  UOM: number;
  PendingMaterialSetup: number;
  MaterialWithoutSubMaterial: number;
}

interface Props {
  procurementMasterData: ProcurementMasterData[];
}

const ProcurementMaster: React.FC<Props> = ({ procurementMasterData = [] }: Props) => {

  const data = [
    {
      title: "Material",
      value: procurementMasterData[0]?.TotalMaterial
    },
    {
      title: "Sub-Material",
      value: procurementMasterData[0]?.TotalSubMaterial
    },
    {
      title: "UOM",
      value: procurementMasterData[0]?.UOM
    },
  ]

  return (
    <div className="space-y-3 pt-5">
      <h1 className="font-semibold text-gray-800 ">Procurement Master</h1>
      <div className="w-full bg-white p-2 border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-md mt-4">
        {data.map((c, i) => {
          return (
            <div key={i}>
              <p className="text-sm text-gray-500 font-semibold">{c.title}</p>
              <p className="text-lg font-semibold text-gray-900">{c.value}</p>
            </div>
          );
        })}
      </div>

      <div>
        <div className="w-full bg-yellow-50 p-3 border border-yellow-200 shadow-sm rounded-md flex items-center justify-between mt-5">
          <div>
            <p className="text-sm font-medium">Pending Material Setup</p>
            <p className="text-xs text-gray-600 mt-1">Requires Configuration</p>
            <p className="text-xs text-gray-600 mt-1">{procurementMasterData[0]?.PendingMaterialSetup}</p>
          </div>
          <p className="text-right text-amber-600 font-extrabold text-2xl mr-5">7</p>
        </div>
      </div>
    </div>
  );
};

export default ProcurementMaster;
