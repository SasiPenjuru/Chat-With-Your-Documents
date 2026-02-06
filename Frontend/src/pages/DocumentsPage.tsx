import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Trash2, 
  MessageSquare, 
  Calendar,
  Layers,
  MoreHorizontal,
  Search,
  Grid,
  List,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useNavigate, useOutletContext } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getDocuments, deleteDocument as deleteDocumentApi } from "@/lib/api";
import { useAppStore } from "@/lib/store";

interface Document {
  id: string;
  name: string;
  uploadedAt: string;
  chunks: number;
  embeddingModel: string;
  size: string;
}

interface OutletContext {
  refreshDocuments: () => Promise<void>;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refreshDocuments } = useOutletContext<OutletContext>();
  
  const storeDocuments = useAppStore((state) => state.documents);
  const removeFromStore = useAppStore((state) => state.removeDocument);
  const selectDocument = useAppStore((state) => state.selectDocument);
  const setStoreDocuments = useAppStore((state) => state.setDocuments);

  // Fetch documents from API and merge with store
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await getDocuments();
      const apiDocs = response.documents.map((doc) => ({
        id: doc.document_id,
        name: doc.filename,
        uploadedAt: new Date().toISOString(),
        chunks: doc.num_chunks,
        embeddingModel: doc.embedding_model,
        size: "N/A",
      }));
      
      // Update store with API documents
      setStoreDocuments(response.documents);
      setDocuments(apiDocs);
    } catch (error) {
      console.warn("Failed to fetch from API, using local store:", error);
      // Fall back to store documents
      const localDocs = storeDocuments.map((doc) => ({
        id: doc.document_id,
        name: doc.filename,
        uploadedAt: doc.uploadedAt || new Date().toISOString(),
        chunks: doc.num_chunks,
        embeddingModel: doc.embedding_model,
        size: "N/A",
      }));
      setDocuments(localDocs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteDocumentApi(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      removeFromStore(id);
      // Refresh sidebar documents
      await refreshDocuments();
      toast.success("Document deleted successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Delete failed";
      toast.error(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const handleOpenChat = (doc: Document) => {
    const storeDoc = storeDocuments.find((d) => d.document_id === doc.id);
    if (storeDoc) {
      selectDocument(storeDoc);
    } else {
      selectDocument({
        document_id: doc.id,
        filename: doc.name,
        num_chunks: doc.chunks,
        embedding_model: doc.embeddingModel,
      });
    }
    navigate("/dashboard");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-950">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your uploaded documents and their embeddings
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchDocuments}
              disabled={loading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              onClick={() => navigate("/dashboard/upload")}
              className="gradient-bg text-white border-0 hover:opacity-90"
            >
              Upload New Document
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-white dark:bg-gray-800">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "grid" && "bg-gray-100 dark:bg-gray-700")}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "list" && "bg-gray-100 dark:bg-gray-700")}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Documents Grid/List */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Loader2 className="w-8 h-8 mx-auto text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading documents...</p>
          </motion.div>
        ) : filteredDocuments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="font-medium mb-1 text-gray-900 dark:text-white">No documents found</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {searchQuery
                ? "Try a different search term"
                : "Upload your first document to get started"}
            </p>
          </motion.div>
        ) : viewMode === "grid" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-xl p-5 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenChat(doc)}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Open Chat
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Document</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{doc.name}"? This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(doc.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="font-medium mb-3 line-clamp-2 text-gray-900 dark:text-white">{doc.name}</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(doc.uploadedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Layers className="w-4 h-4" />
                    <span>{doc.chunks} chunks</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{doc.size}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenChat(doc)}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl overflow-hidden"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Document</th>
                  <th className="text-left p-4 font-medium text-gray-900 dark:text-white hidden md:table-cell">Uploaded</th>
                  <th className="text-left p-4 font-medium text-gray-900 dark:text-white hidden sm:table-cell">Chunks</th>
                  <th className="text-left p-4 font-medium text-gray-900 dark:text-white hidden lg:table-cell">Model</th>
                  <th className="text-right p-4 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate text-gray-900 dark:text-white">{doc.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{doc.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      {formatDate(doc.uploadedAt)}
                    </td>
                    <td className="p-4 text-gray-900 dark:text-white hidden sm:table-cell">{doc.chunks}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                      {doc.embeddingModel}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenChat(doc)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Document</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{doc.name}"? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(doc.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
}
