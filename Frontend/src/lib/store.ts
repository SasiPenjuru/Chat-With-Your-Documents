import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Document {
  document_id: string;
  filename: string;
  num_chunks: number;
  embedding_model: string;
  uploadedAt?: string;
}

export interface ApiConfig {
  openaiKey: string;
  huggingfaceKey: string;
  defaultProvider: "openai" | "huggingface";
  defaultModel: string;
  defaultTopK: number;
}

interface AppState {
  // Documents
  documents: Document[];
  selectedDocument: Document | null;
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  removeDocument: (documentId: string) => void;
  selectDocument: (document: Document | null) => void;

  // Config
  config: ApiConfig;
  setConfig: (config: Partial<ApiConfig>) => void;
  getApiKey: (provider: "openai" | "huggingface") => string;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Documents
      documents: [],
      selectedDocument: null,
      setDocuments: (documents) => set({ documents }),
      addDocument: (document) =>
        set((state) => ({
          documents: [...state.documents, { ...document, uploadedAt: new Date().toISOString() }],
        })),
      removeDocument: (documentId) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.document_id !== documentId),
          selectedDocument:
            state.selectedDocument?.document_id === documentId ? null : state.selectedDocument,
        })),
      selectDocument: (document) => set({ selectedDocument: document }),

      // Config
      config: {
        openaiKey: "",
        huggingfaceKey: "",
        defaultProvider: "openai",
        defaultModel: "gpt-4o-mini",
        defaultTopK: 5,
      },
      setConfig: (config) =>
        set((state) => ({
          config: { ...state.config, ...config },
        })),
      getApiKey: (provider) => {
        const config = get().config;
        return provider === "openai" ? config.openaiKey : config.huggingfaceKey;
      },
    }),
    {
      name: "rag-app-storage",
      partialize: (state) => ({
        config: state.config,
        documents: state.documents,
        selectedDocument: state.selectedDocument,
      }),
    }
  )
);
