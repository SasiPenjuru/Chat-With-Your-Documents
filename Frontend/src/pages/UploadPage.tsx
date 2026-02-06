import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate, useOutletContext } from "react-router-dom";
import { uploadDocument, getConfig } from "@/lib/api";
import { useAppStore } from "@/lib/store";

// Default fallback models in case API fails
const defaultEmbeddingModels = [
  { value: "sentence-transformers/all-MiniLM-L6-v2", label: "all-MiniLM-L6-v2 (Fast)" },
  { value: "sentence-transformers/all-mpnet-base-v2", label: "all-mpnet-base-v2 (Balanced)" },
  { value: "BAAI/bge-small-en-v1.5", label: "BGE Small (High quality)" },
  { value: "BAAI/bge-base-en-v1.5", label: "BGE Base (High quality)" },
];

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

interface UploadedFile {
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  documentId?: string;
  chunks?: number;
}

interface OutletContext {
  refreshDocuments: () => Promise<void>;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [embeddingModel, setEmbeddingModel] = useState(defaultEmbeddingModels[0].value);
  const [embeddingModels, setEmbeddingModels] = useState(defaultEmbeddingModels);
  const navigate = useNavigate();
  const { refreshDocuments } = useOutletContext<OutletContext>();
  const addDocument = useAppStore((state) => state.addDocument);

  // Fetch embedding models from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getConfig();
        if (config.embedding_models && config.embedding_models.length > 0) {
          const models = config.embedding_models.map((m) => ({
            value: m.name,
            label: `${m.name.split("/").pop()} (${m.description})`,
          }));
          setEmbeddingModels(models);
          setEmbeddingModel(models[0].value);
        }
      } catch (error) {
        console.warn("Failed to fetch config, using defaults:", error);
      }
    };
    fetchConfig();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter((file) => file.type === "application/pdf");
    
    if (pdfFiles.length !== acceptedFiles.length) {
      toast.error("Only PDF files are supported");
    }

    const newFiles = pdfFiles.map((file) => ({
      file,
      status: "idle" as UploadStatus,
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileIndex: number) => {
    const uploadedFile = files[fileIndex];
    
    // Set to uploading state
    setFiles((prev) =>
      prev.map((f, i) =>
        i === fileIndex ? { ...f, status: "uploading" as UploadStatus, progress: 0 } : f
      )
    );

    try {
      const response = await uploadDocument(
        uploadedFile.file,
        embeddingModel,
        (progress) => {
          setFiles((prev) =>
            prev.map((f, i) => (i === fileIndex ? { ...f, progress } : f))
          );
        }
      );

      // Set to processing while backend creates embeddings
      setFiles((prev) =>
        prev.map((f, i) =>
          i === fileIndex ? { ...f, status: "processing" as UploadStatus, progress: 100 } : f
        )
      );

      // Small delay to show processing state
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update to success with real data from backend
      setFiles((prev) =>
        prev.map((f, i) =>
          i === fileIndex
            ? {
                ...f,
                status: "success" as UploadStatus,
                documentId: response.document_id,
                chunks: response.num_chunks,
              }
            : f
        )
      );

      // Add to global store
      addDocument({
        document_id: response.document_id,
        filename: response.filename,
        num_chunks: response.num_chunks,
        embedding_model: response.embedding_model,
      });

      // Refresh sidebar documents list
      await refreshDocuments();

      toast.success(`"${uploadedFile.file.name}" uploaded and indexed successfully!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setFiles((prev) =>
        prev.map((f, i) =>
          i === fileIndex
            ? { ...f, status: "error" as UploadStatus, error: errorMessage }
            : f
        )
      );
      toast.error(errorMessage);
    }
  };

  const handleUpload = async () => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "idle") {
        await uploadFile(i);
      }
    }
  };

  const handleStartChat = () => {
    const successFiles = files.filter((f) => f.status === "success");
    if (successFiles.length > 0) {
      navigate("/dashboard");
    }
  };

  const pendingCount = files.filter((f) => f.status === "idle").length;
  const successCount = files.filter((f) => f.status === "success").length;
  const isProcessing = files.some((f) => f.status === "uploading" || f.status === "processing");

  return (
    <div className="h-full overflow-auto mesh-gradient">
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Upload Documents</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload PDF documents to create searchable vector embeddings
          </p>
        </motion.div>

        {/* Dropzone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div
            {...getRootProps()}
            className={`glass-card rounded-2xl p-8 border-2 border-dashed transition-all duration-300 cursor-pointer ${
              isDragActive
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                : "border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
              {isDragActive ? "Drop your files here" : "Drag & drop PDF files"}
            </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                or click to browse from your computer
              </p>
              <Button variant="outline" type="button">
                Browse Files
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Embedding Model Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 glass-card rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Embedding Model</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose the model for creating vector embeddings
              </p>
            </div>
            <div className="relative">
              <Input
                type="text"
                value={embeddingModel}
                onChange={(e) => setEmbeddingModel(e.target.value)}
                list="embedding-models"
                placeholder="Type or select model..."
                className="w-[280px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
              <datalist id="embedding-models">
                {embeddingModels.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </datalist>
            </div>
          </div>
        </motion.div>

        {/* File List */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 space-y-3"
          >
            <h4 className="font-medium text-gray-900 dark:text-white">Files ({files.length})</h4>
            {files.map((uploadedFile, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-gray-900 dark:text-white">{uploadedFile.file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {uploadedFile.status === "idle" && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                      </span>
                    )}
                    {uploadedFile.status === "uploading" && (
                      <>
                        <Progress value={uploadedFile.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {uploadedFile.progress}%
                        </span>
                      </>
                    )}
                    {uploadedFile.status === "processing" && (
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Creating embeddings...
                      </span>
                    )}
                    {uploadedFile.status === "success" && (
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {uploadedFile.chunks} chunks indexed
                      </span>
                    )}
                    {uploadedFile.status === "error" && (
                      <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {uploadedFile.error || "Upload failed"}
                      </span>
                    )}
                  </div>
                </div>
                {uploadedFile.status === "idle" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                {uploadedFile.status === "success" && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Actions */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex items-center justify-between"
          >
            <Button
              variant="outline"
              onClick={() => setFiles([])}
              disabled={isProcessing}
            >
              Clear All
            </Button>
            <div className="flex items-center gap-3">
              {successCount > 0 && (
                <Button variant="outline" onClick={handleStartChat}>
                  Start Chatting
                </Button>
              )}
              {pendingCount > 0 && (
                <Button
                  onClick={handleUpload}
                  disabled={isProcessing}
                  className="gradient-bg text-white border-0 hover:opacity-90"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload {pendingCount} file{pendingCount > 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
