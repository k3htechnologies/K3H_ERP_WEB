import useToast from "@/core/hooks/useToast";
import { OutDoorDataService } from "@/features/outdoor/services/OutDoorDataService";
import { useEffect, useRef, useState } from "react";
import * as E from "fp-ts/Either";
import type {
  FilterWithPaginationOutDoor,
  OutDoorMasterData,
} from "../models/OutDoorModel";
import { ToastContainer } from "@/ui/components/Toast";
import { useNavigate } from "react-router-dom";
import { Loader } from "@/core/utils/loader";
import { ExpandableCard } from "@/ui/components/Card/ExpandableCard";

export const OutDoor: React.FC = () => {
  const { toasts, removeToast, addToast } = useToast();
  const [OutDoorList, setOutDoorList] = useState<OutDoorMasterData[]>([]);
  const [isLoading] = useState(false);
  const [loadingMessage] = useState("");
  const isUIRendered = useRef(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (isUIRendered.current) {
      return;
    }
    isUIRendered.current = true;
    loadOutDoor();
  });

  const loadOutDoor = async (filterParams?: FilterInfo) => {
    const params: FilterWithPaginationOutDoor = {
      PageNumber: 1,
      PageSize: 20,
      StartDate: filterParams?.StartDate
        ? new Date(filterParams.StartDate).toISOString()
        : "",
      EndDate: filterParams?.EndDate
        ? new Date(filterParams.EndDate).toISOString()
        : "",
    };
    const apiResponse = await OutDoorDataService.apiCallPullOutDoorData(params);
    if (E.isRight(apiResponse)) {
      setOutDoorList(apiResponse.right.Data);
    } else {
      addToast({ type: "error", title: "Error Fetching Outdoor" });
    }
  };

  return (
    <>
      <div>
        <ToastContainer
          toasts={toasts}
          onRemoveToast={removeToast}
        ></ToastContainer>
        <Loader loading={isLoading} title={loadingMessage}>
          <div></div>
        </Loader>
      <div >
           <ul>
       {OutDoorList.map((item=>(
        <li key={item.OutdoorId}>
          <ExpandableCard title={item.OutDoorDate} showline={false} child={item.CompanyName}/>
        </li>

       )))}
       </ul>

      </div>
    
    
      </div>
    </>
  );
};
