import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { technicalService } from "@/features/technical/services/TechnicalService";
import * as E from "fp-ts/Either";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigatingRef = useRef(false);
  const retryRef = useRef({ inProgress: false, attempts: 0 });


  const checkConnectivity = async (): Promise<boolean> => {
    try {
      const response = await technicalService.apiCallGetEnvironment();
      return E.isRight(response);
    } catch {
      return false;
    }
  };

  useEffect(() => {

    const guardedNavigate = (target: string, replace = true) => {
      if (isNavigatingRef.current) return;
      if (location.pathname === target) return;
      isNavigatingRef.current = true;
      navigate(target, { replace });

      setTimeout(() => (isNavigatingRef.current = false), 600);
    };

    const onOffline = () => {
      setIsOnline(false);


      if (location.pathname !== "/error") {
        LocalStorageHelper.storeLastVisitedPage(location.pathname);
      }

      guardedNavigate("/error", true);
    };

    const onOnline = async () => {
      setIsOnline(true);


      if (location.pathname !== "/error") return;

      if (retryRef.current.inProgress) return;
      retryRef.current.inProgress = true;

      // do a few retries with delay, but limited
      const maxRetries = 3;
      let ok = false;

      for (let i = 0; i < maxRetries; i++) {

        if (i > 0) await new Promise((r) => setTimeout(r, 1500));

        const reachable = await checkConnectivity();
        if (reachable) {
          ok = true;
          break;
        }
      }

      retryRef.current.inProgress = false;

      if (ok) {

        const last = LocalStorageHelper.getLastVisitedPage() ?? "/dashboard";
        guardedNavigate(last, true);
      } else {
        console.warn("Network reported online but backend not reachable");
      }
    };

    // Attach handlers
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);


    if (!navigator.onLine) {
      onOffline();
    }

    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [navigate, location]);

  return { isOnline };
};
