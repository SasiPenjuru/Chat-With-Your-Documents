import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  MessageSquare, 
  Settings, 
  Upload, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FolderOpen,
  Clock,
  Plus,
  Loader2,
  RefreshCw,
  PanelLeftClose,
  PanelLeft,
  GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useAppStore } from "@/lib/store";
import { getDocuments, deleteDocument } from "@/lib/api";
import { toast } from "sonner";

const MIN_SIDEBAR_WIDTH = 72;
const MAX_SIDEBAR_WIDTH = 400;
const DEFAULT_SIDEBAR_WIDTH = 280;

export default function DashboardLayout() {
  // Load sidebar state from localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });
  
  // Load sidebar width from localStorage
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("sidebar-width");
    return saved ? parseInt(saved, 10) : DEFAULT_SIDEBAR_WIDTH;
  });
  
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Persist sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);
  
  // Persist sidebar width to localStorage
  useEffect(() => {
    if (!sidebarCollapsed) {
      localStorage.setItem("sidebar-width", String(sidebarWidth));
    }
  }, [sidebarWidth, sidebarCollapsed]);

  // Handle resize mouse events
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing && sidebarRef.current) {
      const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
      
      // Auto-collapse if dragged below minimum
      if (newWidth < MIN_SIDEBAR_WIDTH + 20) {
        setSidebarCollapsed(true);
      } else if (newWidth >= MIN_SIDEBAR_WIDTH + 20 && sidebarCollapsed) {
        setSidebarCollapsed(false);
      }
      
      // Clamp width within bounds
      const clampedWidth = Math.min(Math.max(newWidth, MIN_SIDEBAR_WIDTH + 40), MAX_SIDEBAR_WIDTH);
      setSidebarWidth(clampedWidth);
    }
  }, [isResizing, sidebarCollapsed]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      // Prevent text selection during resize
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    }
    
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing, resize, stopResizing]);

  // Use Zustand store for documents
  const documents = useAppStore((state) => state.documents);
  const selectedDocument = useAppStore((state) => state.selectedDocument);
  const setDocuments = useAppStore((state) => state.setDocuments);
  const selectDocument = useAppStore((state) => state.selectDocument);
  const removeDocument = useAppStore((state) => state.removeDocument);

  // Fetch documents from API
  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const response = await getDocuments();
      setDocuments(response.documents);
    } catch (error) {
      console.warn("Failed to fetch documents:", error);
      // Keep existing documents from store if API fails
    } finally {
      setLoadingDocs(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle document deletion
  const handleDeleteDocument = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    setDeletingId(docId);
    try {
      await deleteDocument(docId);
      removeDocument(docId);
      if (selectedDocument?.document_id === docId) {
        selectDocument(null);
      }
      toast.success("Document deleted");
    } catch (error) {
      toast.error("Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle document selection
  const handleSelectDocument = (doc: typeof documents[0]) => {
    selectDocument(doc);
    navigate("/dashboard");
  };

  const isActive = (path: string) => location.pathname.includes(path);

  // Calculate actual sidebar width
  const actualWidth = sidebarCollapsed ? MIN_SIDEBAR_WIDTH : sidebarWidth;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        style={{ width: actualWidth }}
        className={cn(
          "flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col relative",
          isResizing ? "" : "transition-[width] duration-200 ease-in-out"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <div 
            className={cn(
              "flex items-center gap-2 overflow-hidden transition-opacity duration-200",
              sidebarCollapsed ? "opacity-0 w-0" : "opacity-100"
            )}
          >
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-lg whitespace-nowrap text-gray-900 dark:text-white">Sasi Web App</span>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? (
                  <PanelLeft className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          {/* Upload Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => navigate("/dashboard/upload")}
                className={cn(
                  "w-full mb-4 gradient-bg text-white border-0 hover:opacity-90",
                  sidebarCollapsed ? "px-0 justify-center" : ""
                )}
              >
                <Upload className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">Upload Document</span>}
              </Button>
            </TooltipTrigger>
            {sidebarCollapsed && (
              <TooltipContent side="right">Upload Document</TooltipContent>
            )}
          </Tooltip>

          {/* Navigation */}
          <div className="space-y-1 mb-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate("/dashboard")}
                  className={cn(
                    "sidebar-item w-full",
                    sidebarCollapsed && "justify-center",
                    isActive("/dashboard") && location.pathname === "/dashboard" && "sidebar-item-active"
                  )}
                >
                  <MessageSquare className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>Chat</span>}
                </button>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right">Chat</TooltipContent>
              )}
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate("/dashboard/documents")}
                  className={cn(
                    "sidebar-item w-full",
                    sidebarCollapsed && "justify-center",
                    isActive("/documents") && "sidebar-item-active"
                  )}
                >
                  <FolderOpen className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>Documents</span>}
                </button>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right">Documents</TooltipContent>
              )}
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate("/dashboard/config")}
                  className={cn(
                    "sidebar-item w-full",
                    sidebarCollapsed && "justify-center",
                    isActive("/config") && "sidebar-item-active"
                  )}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>Configuration</span>}
                </button>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right">Configuration</TooltipContent>
              )}
            </Tooltip>
          </div>

          {/* Documents List */}
          {!sidebarCollapsed && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Documents ({documents.length})
                  </span>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={fetchDocuments}
                      disabled={loadingDocs}
                    >
                      <RefreshCw className={cn("w-3 h-3", loadingDocs && "animate-spin")} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => navigate("/dashboard/upload")}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  {loadingDocs ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-4 px-2">
                      <FileText className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">No documents yet</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={() => navigate("/dashboard/upload")}
                      >
                        Upload first document
                      </Button>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <button
                        key={doc.document_id}
                        onClick={() => handleSelectDocument(doc)}
                        className={cn(
                          "sidebar-item w-full group",
                          selectedDocument?.document_id === doc.document_id && "sidebar-item-active"
                        )}
                      >
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 text-left min-w-0">
                          <span className="truncate block text-sm text-gray-700 dark:text-gray-300">
                            {doc.filename}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {doc.num_chunks} chunks
                          </span>
                        </div>
                        {deletingId === doc.document_id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                        ) : (
                          <Trash2 
                            className="w-3 h-3 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-red-500 transition-opacity" 
                            onClick={(e) => handleDeleteDocument(e, doc.document_id)}
                          />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Recent Activity */}
          {!sidebarCollapsed && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quick Actions
                  </span>
                </div>
                <div className="space-y-1">
                  {selectedDocument ? (
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="sidebar-item w-full"
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm truncate text-gray-700 dark:text-gray-300">
                          Chat with {selectedDocument.filename.slice(0, 15)}...
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Active document</p>
                      </div>
                    </button>
                  ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2">
                      Select a document to start chatting
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <div className={cn(
            "flex items-center gap-2 mb-2",
            sidebarCollapsed ? "justify-center" : "justify-between"
          )}>
            {!sidebarCollapsed && <ThemeToggle />}
            {sidebarCollapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div><ThemeToggle /></div>
                </TooltipTrigger>
                <TooltipContent side="right">Toggle theme</TooltipContent>
              </Tooltip>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/")}
                className={cn(
                  "sidebar-item w-full text-gray-700 dark:text-gray-300",
                  sidebarCollapsed && "justify-center"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                {!sidebarCollapsed && <span>Back to Home</span>}
              </button>
            </TooltipTrigger>
            {sidebarCollapsed && (
              <TooltipContent side="right">Back to Home</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={startResizing}
          className={cn(
            "absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:bg-indigo-500/50 transition-colors",
            isResizing && "bg-indigo-500"
          )}
        >
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 -right-1.5 w-4 h-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
            isResizing && "opacity-100 bg-indigo-500 dark:bg-indigo-500"
          )}>
            <GripVertical className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 overflow-hidden transition-all duration-200">
        <Outlet context={{ refreshDocuments: fetchDocuments }} />
      </main>
    </div>
  );
}