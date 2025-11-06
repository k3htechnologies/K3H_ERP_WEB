// ✅ src/core/hooks/NetworkStatusWatcher.tsx
import React from "react";
import { useNetworkStatus } from "./useNetworkStatus";

export const NetworkStatusWatcher: React.FC = () => {
  useNetworkStatus();
  return null;
};
