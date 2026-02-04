import React from "react";

const ProjectStatus: React.FC = () => {
  return (

   <div className="space-y-3 pt-14">
      <div className="w-full bg-white p-3 border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-md">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">Active Projects</p>
            <p className="text-sm  font-normal text-black">12/20</p>
          </div>

          <div className="w-xl bg-gray-200 h-2 rounded-sm">
            <div className="w-1/2 sm:w-1/2 bg-blue-500 h-2 rounded-sm"></div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">
              On Hold Projects
            </p>
            <p className="text-sm font-normal text-black">05/20</p>
          </div>
          <div className="w-xl bg-gray-200 h-2 rounded-sm">
            <div className="w-21 sm:w-21 bg-blue-500 h-2 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatus;
