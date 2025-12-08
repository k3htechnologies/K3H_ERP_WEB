import useToast from "@/core/hooks/useToast";
import { OutDoorDataService } from "@/features/outdoor/services/OutDoorDataService";
import { useEffect, useRef, useState, useCallback, useMemo, memo } from "react";
import * as E from "fp-ts/Either";
import type {
  FilterWithPaginationOutDoor,
  OutDoorMasterData,
} from "../models/OutDoorModel";
import { ToastContainer } from "@/ui/components/Toast";
import { Loader } from "@/core/utils/loader";
import { formatDate_dd_MonthName_yy, formatTimeFromDateTime } from "@/core/utils/dateFormat";
import type { FilterInfo } from "@/ui/components/DataTable/DataTable";
import { usePagination } from "@/core/hooks/usePagination";
import { Pagination, type PaginationInfo } from "@/ui/components/Pagination/Pagination";
import { useNavigate } from "react-router-dom";
import { 
  Clock, 
  Building2, 
  MapPin, 
  Target, 
  Users, 
  User, 
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Fingerprint,
  Plus,
  ClipboardCheck,
  AlertTriangle,
  Edit
} from "lucide-react";
import { getCurrentLocation, formatLocationString, type LocationData } from "@/core/utils/locationUtils";
import { runApiWithLoader } from "@/core/utils";
import { Modal } from "@/ui/components/Modal/Modal";
import { TextArea } from "@/ui/components/forms/Textarea";
import { parseOutdoorDate, parseOutdoorTime, isToday, isPreviousDate } from "../utils/outdoorDateUtils";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { MultiImageViewer } from "@/ui/components/ImageViewer/ImageViewer";

export const OutDoor: React.FC = () => {
  const { toasts, removeToast, addToast } = useToast();
  const navigate = useNavigate();
  const [OutDoorList, setOutDoorList] = useState<OutDoorMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { pagination, setPagination } = usePagination(10);
  const isUIRendered = useRef(false);
  const isLoadingRef = useRef(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [punchingItemId, setPunchingItemId] = useState<number | null>(null);
  const [conclusionModalOpen, setConclusionModalOpen] = useState(false);
  const [selectedOutdoorItem, setSelectedOutdoorItem] = useState<OutDoorMasterData | null>(null);
  const [conclusionText, setConclusionText] = useState("");

  const loadOutDoor = useCallback(async (page: number, filterParams?: FilterInfo) => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setIsLoading(true);
    setLoadingMessage("Loading outdoor data...");
    setOutDoorList([]);
    
    try {
      const params: FilterWithPaginationOutDoor = {
        PageNumber: page,
        PageSize: pagination.pageSize,
        StartDate: filterParams?.StartDate
          ? new Date(filterParams.StartDate).toISOString()
          : "",
        EndDate: filterParams?.EndDate
          ? new Date(filterParams.EndDate).toISOString()
          : "",
      };

      const apiResponse = await OutDoorDataService.apiCallPullOutDoorData(params);
      if (E.isRight(apiResponse)) {
        const responseData = apiResponse.right.Data || [];
        const totalRecords = apiResponse.right.TotalNumberOfRecord || 0;
        
        setOutDoorList(responseData);
        setPagination({
          currentPage: page,
          totalRecords,
          totalPages: Math.ceil(totalRecords / pagination.pageSize),
        });
      } else {
        addToast({ type: "error", title: "Error Fetching Outdoor" });
      }
    } catch {
      addToast({ type: "error", title: "Error Fetching Outdoor" });
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
      setLoadingMessage("");
    }
  }, [pagination.pageSize, setPagination, addToast]);

  useEffect(() => {
    if (isUIRendered.current) return;
    isUIRendered.current = true;
    loadOutDoor(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = useCallback((page: number) => {
    if (isLoadingRef.current || page < 1 || (pagination.totalPages > 0 && page > pagination.totalPages)) {
      return;
    }
    loadOutDoor(page);
  }, [loadOutDoor, pagination.totalPages]);

  const toggleCard = useCallback((outdoorId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(outdoorId)) {
        newSet.delete(outdoorId);
      } else {
        newSet.add(outdoorId);
      }
      return newSet;
    });
  }, []);

  const canPunchInOut = useCallback((outdoorDate: string, outdoorTime: string): boolean => {
    if (!outdoorDate || !outdoorTime) return false;
    
    try {
      const outdoorDateObj = parseOutdoorDate(outdoorDate);
      if (!outdoorDateObj || !isToday(outdoorDateObj)) {
        return false;
      }
      
      const meetingDateTime = parseOutdoorTime(outdoorDate, outdoorTime);
      if (!meetingDateTime) {
        return false;
      }
      
      return new Date() >= meetingDateTime;
    } catch {
      return false;
    }
  }, []);

  const hasMissedPunch = useCallback((item: OutDoorMasterData): boolean => {
    if (!item.OutDoorDate || !item.OutDoorTime) return false;
    
    try {
      const outdoorDateObj = parseOutdoorDate(item.OutDoorDate);
      if (!outdoorDateObj || !isToday(outdoorDateObj)) {
        return false;
      }
      
      const meetingDateTime = parseOutdoorTime(item.OutDoorDate, item.OutDoorTime);
      if (!meetingDateTime || new Date() < meetingDateTime) {
        return false;
      }
      
      if (!item.PunchIn) {
        return true;
      }
      
      if (item.PunchIn && !item.PunchOut) {
        const punchInTime = new Date(item.PunchIn);
        if (!isNaN(punchInTime.getTime())) {
          const timeSincePunchIn = new Date().getTime() - punchInTime.getTime();
          const thirtyMinutes = 30 * 60 * 1000;
          return timeSincePunchIn >= thirtyMinutes;
        }
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }, []);

  const hasMissedPunchInPreviousDate = useCallback((item: OutDoorMasterData): boolean => {
    if (!item.OutDoorDate || item.PunchIn) return false;
    
    try {
      const outdoorDateObj = parseOutdoorDate(item.OutDoorDate);
      return outdoorDateObj !== null && isPreviousDate(outdoorDateObj);
    } catch {
      return false;
    }
  }, []);

  const handlePunchInOut = useCallback(async (item: OutDoorMasterData) => {
    if (punchingItemId !== null) return;
    
    setPunchingItemId(item.OutdoorId);
    
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        try {
          // Capture time first to ensure accuracy
          const now = new Date();
          const currentDateTime = now.toISOString();
          
          // Get current location with retry for better accuracy
          let location: LocationData | null = null;
          let retries = 0;
          const maxRetries = 2;
          
          while (retries <= maxRetries && !location) {
            try {
              location = await getCurrentLocation();
            } catch (error) {
              if (retries === maxRetries) {
                throw error;
              }
              retries++;
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          if (!location) {
            throw new Error("Failed to get location after retries");
          }
          
          const locationString = formatLocationString(location);

          // Check if already punched in and out
          if (item.PunchIn && item.PunchOut) {
            addToast({ 
              type: "warning", 
              title: "Already punched in and out" 
            });
            setPunchingItemId(null);
            return;
          }

          // Use same API for both punch in and punch out
          const response = await OutDoorDataService.apiCallPunchInOut({
            OutdoorId: item.OutdoorId,
            Punch: currentDateTime,
            Address: locationString
          });

          if (E.isRight(response)) {
            const apiResponse = response.right;
            
            // Check if API response has error messages
            if (!apiResponse.IsSuccess || (apiResponse.ErrorMessage && apiResponse.ErrorMessage.length > 0)) {
              const errorMessage = apiResponse.ErrorMessage?.[0] || apiResponse.WarningMessage?.[0] || "Failed to punch in/out";
              addToast({ 
                type: "error", 
                title: errorMessage 
              });
            } else {
              await loadOutDoor(pagination.currentPage);
              const successMessage = apiResponse.SuccessMessage?.[0] || (!item.PunchIn ? "Punched In Successfully" : "Punched Out Successfully");
              addToast({ 
                type: "success", 
                title: successMessage 
              });
            }
          } else {
            addToast({ 
              type: "error", 
              title: response.left.message || "Failed to punch in/out" 
            });
          }
        } catch (error: unknown) {
          const errorMessage = (error as { message?: string })?.message || "Failed to get location or punch in/out";
          addToast({ 
            type: "error", 
            title: errorMessage 
          });
        } finally {
          setPunchingItemId(null);
        }
      },
      undefined,
      (error: unknown) => {
        addToast({ 
          type: "error", 
          title: (error as { message?: string })?.message || "Failed to punch in/out" 
        });
        setPunchingItemId(null);
      },
      undefined,
      !item.PunchIn ? "Punching In..." : "Punching Out..."
    );
  }, [punchingItemId, loadOutDoor, pagination.currentPage, addToast, setIsLoading, setLoadingMessage]);

  const handleOpenConclusionModal = useCallback((item: OutDoorMasterData) => {
    setSelectedOutdoorItem(item);
    setConclusionText(item.Conclusion || "");
    setConclusionModalOpen(true);
  }, []);

  const handleCloseConclusionModal = useCallback(() => {
    setConclusionModalOpen(false);
    setSelectedOutdoorItem(null);
    setConclusionText("");
  }, []);

  const handleSaveConclusion = useCallback(async () => {
    if (!selectedOutdoorItem) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await OutDoorDataService.apiCallAddUpdateConclusion({
          OutdoorId: selectedOutdoorItem.OutdoorId,
          Conclusion: conclusionText
        });

        if (E.isRight(response)) {
          await loadOutDoor(pagination.currentPage);
          addToast({ 
            type: "success", 
            title: "Conclusion saved successfully" 
          });
          handleCloseConclusionModal();
        } else {
          addToast({ 
            type: "error", 
            title: response.left.message || "Failed to save conclusion" 
          });
        }
      },
      undefined,
      (error: unknown) => {
        addToast({ 
          type: "error", 
          title: (error as { message?: string })?.message || "Failed to save conclusion" 
        });
      },
      undefined,
      'Saving conclusion...'
    );
  }, [selectedOutdoorItem, conclusionText, loadOutDoor, pagination.currentPage, addToast, setIsLoading, setLoadingMessage, handleCloseConclusionModal]);

  const handleAddOutdoor = useCallback(() => {
    navigate("/outdoor/add");
  }, [navigate]);

  const paginationInfo: PaginationInfo = useMemo(() => ({
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalRecords: pagination.totalRecords,
    pageSize: pagination.pageSize,
    onPageChange: handlePageChange,
  }), [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]);

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Outdoor Visits</h2>
            <button
              onClick={handleAddOutdoor}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Outdoor
            </button>
          </div>
          
          {OutDoorList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No outdoor records found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {OutDoorList.map((item) => {
                const isExpanded = expandedCards.has(item.OutdoorId);
                const isMeetingStarted = canPunchInOut(item.OutDoorDate, item.OutDoorTime);
                const hasMissed = hasMissedPunch(item);
                const hasMissedPrevious = hasMissedPunchInPreviousDate(item);
                
                return (
                  <OutDoorCard
                    key={item.OutdoorId}
                    item={item}
                    isExpanded={isExpanded}
                    isMeetingStarted={isMeetingStarted}
                    isPunching={punchingItemId === item.OutdoorId}
                    hasMissedPunch={hasMissed}
                    hasMissedPunchInPreviousDate={hasMissedPrevious}
                  onToggle={() => toggleCard(item.OutdoorId)}
                  onPunchInOut={() => handlePunchInOut(item)}
                  onAddConclusion={() => handleOpenConclusionModal(item)}
                  onEdit={() => navigate(`/outdoor/add/${item.OutdoorId}`)}
                  />
                );
              })}
            </div>
          )}
        </div>
        <Pagination pagination={paginationInfo} className="mt-4" />
      </div>

      {/* Conclusion Modal */}
      <Modal
        isOpen={conclusionModalOpen}
        onClose={handleCloseConclusionModal}
        title="Add Conclusion"
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveConclusion();
        }}
        saveText="Save"
        cancelText="Cancel"
        onCancel={handleCloseConclusionModal}
        loading={isLoading}
        size="md"
      >
        <TextArea
          label="Conclusion"
          value={conclusionText}
          onChange={(e) => setConclusionText(e.target.value)}
          placeholder="Enter conclusion about the outdoor visit..."
          rows={6}
          autoResize={true}
        />
      </Modal>
    </>
  );
};

// Memoized Card Component
interface OutDoorCardProps {
  item: OutDoorMasterData;
  isExpanded: boolean;
  isMeetingStarted: boolean;
  isPunching: boolean;
  hasMissedPunch: boolean;
  hasMissedPunchInPreviousDate: boolean;
  onToggle: () => void;
  onPunchInOut: () => void;
  onAddConclusion: () => void;
  onEdit: () => void;
}

const OutDoorCard = memo<OutDoorCardProps>(({ 
  item, 
  isExpanded, 
  isMeetingStarted, 
  isPunching,
  hasMissedPunch,
  hasMissedPunchInPreviousDate,
  onToggle, 
  onPunchInOut,
  onAddConclusion,
  onEdit
}) => {
  const punchStatus = useMemo(() => {
    if (!item.PunchIn) return { color: 'text-green-600', title: 'Punch In' };
    if (!item.PunchOut) return { color: 'text-blue-600', title: 'Punch Out' };
    return { color: 'text-purple-600', title: 'Already Punched Out' };
  }, [item.PunchIn, item.PunchOut]);

  const isPunchedInAndOut = item.PunchIn && item.PunchOut;


  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Card Header */}
      <div 
        className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {formatDate_dd_MonthName_yy(item.OutDoorDate)}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTimeFromDateTime(item.OutDoorTime) || 'N/A'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasMissedPunch && (
              <div className="p-1.5 rounded-lg" title={!item.PunchIn ? "Punch In missed" : "Punch Out missed"}>
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            )}
            {isPunchedInAndOut ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddConclusion();
                }}
                className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                title={item.Conclusion ? "Edit Conclusion" : "Add Conclusion"}
              >
                <ClipboardCheck className={`w-5 h-5 ${item.Conclusion ? 'text-purple-600' : 'text-gray-600'}`} />
              </button>
            ) : isMeetingStarted ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPunchInOut();
                }}
                disabled={isPunching}
                className="p-1.5 rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={punchStatus.title}
              >
                {isPunching ? (
                  <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Fingerprint className={`w-5 h-5 ${punchStatus.color}`} />
                )}
              </button>
            ) : null}
            <button className="p-1.5 rounded-lg hover:bg-white/50 transition-colors">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Card Body - Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Company Name</p>
                  <p className="text-sm font-semibold text-gray-900">{item.CompanyName || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-green-50 rounded-lg border border-green-100">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Company Address</p>
                  <p className="text-sm font-semibold text-gray-900">{item.CompanyAddress || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                <Target className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Purpose</p>
                  <p className="text-sm font-semibold text-gray-900">{item.Purpose || 'N/A'}</p>
                </div>
              </div>

              {item.Conclusion && (
                <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                  <ClipboardCheck className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Conclusion</p>
                    <p className="text-sm text-gray-600">{item.Conclusion}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {item.DepartmentName && (
                <div className="flex items-start gap-2.5 p-2.5 bg-cyan-50 rounded-lg border border-cyan-100">
                  <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Department</p>
                    <p className="text-sm font-semibold text-gray-900">{item.DepartmentName}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5 p-2.5 bg-orange-50 rounded-lg border border-orange-100">
                <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Accompanied By</p>
                  <p className="text-sm font-semibold text-gray-900">{item.AccompaniedByName || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Requested By</p>
                  <p className="text-sm font-semibold text-gray-900">{item.CreatedBy || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium shadow-sm min-w-[110px] justify-center"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Punch In/Out Section */}
          {(item.PunchIn || item.PunchOut || hasMissedPunchInPreviousDate) && (
            <div className="border-t border-gray-200 pt-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Fingerprint className="w-4 h-4" />
                Attendance
              </h4>
              {hasMissedPunchInPreviousDate ? (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-700">Attendance is not marked</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {item.PunchIn && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-xs font-semibold text-green-700 uppercase">Punch In</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {formatTimeFromDateTime(item.PunchIn) || 'N/A'}
                      </p>
                      {item.PunchInAddress && (
                        <p className="text-xs text-gray-600 flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{item.PunchInAddress}</span>
                        </p>
                      )}
                    </div>
                  )}
                  {item.PunchOut && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <p className="text-xs font-semibold text-blue-700 uppercase">Punch Out</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {formatTimeFromDateTime(item.PunchOut) || 'N/A'}
                      </p>
                      {item.PunchOutAddress && (
                        <p className="text-xs text-gray-600 flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{item.PunchOutAddress}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Visiting Card Section */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Visiting Card</p>
                  <p className="text-xs text-gray-500">Document attachment</p>
                </div>
              </div>
              {item.VisitingCardURL ? (() => {
                const cardUrls = parseDocumentUrls(item.VisitingCardURL);
                const images = cardUrls.map(url => ({ url }));
                return (
                  <MultiImageViewer
                    images={images}
                    title="Visiting Card"
                    triggerLabel={
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium shadow-sm">
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Card{cardUrls.length > 1 ? ` (${cardUrls.length})` : ''}
                      </button>
                    }
                  />
                );
              })() : (
                <span className="text-xs text-gray-400 italic">Not Uploaded</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

OutDoorCard.displayName = 'OutDoorCard';
