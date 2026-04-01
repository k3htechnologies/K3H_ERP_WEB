import React from "react";
import { Button } from "@/ui/components/forms";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PayrollHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <div
        className="bg-white rounded-xl p-4 flex flex-col  lg:flex-row lg:items-center justify-between shadow-sm"

      >
        <div className="w-full lg:w-auto lg:mt-0 p-2 -mb-2">
        </div>

        {/*Button Group  */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-4 ">
          <Button
            variant="solid"
            color="blue"
            leftIcon={<Plus size={14} />}
            className="w-full lg:w-auto text-sm"
            onClick={() => {
              navigate("/leave/add");
            }}
          >
            Apply Leave
          </Button>

          <Button
            color="blue"
            variant="solid"
            colorMode="extraLight"
            leftIcon={<FileText size={14} />}
            className="w-full lg:w-auto text-sm"
            onClick={() => {
              navigate("/compOff");
            }}
          >
            Request Comp-Off
          </Button>

          <Button
            color="blue"
            variant="solid"
            colorMode="extraLight"
            leftIcon={<Plus size={14} />}
            className="w-full lg:w-auto text-sm"
            onClick={() => {
              navigate("/outdoor/add");
            }}
          >
            Add Outdoor
          </Button>
        </div>
      </div>
    </>
  );
};

export default PayrollHeader;
