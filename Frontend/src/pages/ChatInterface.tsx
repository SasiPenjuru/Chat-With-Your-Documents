import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Paperclip, 
  ChevronDown, 
  ChevronRight,
  FileText,
  Sparkles,
  Copy,
  RefreshCw,
  Info,
  X,
  Sliders,
  AlertCircle,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppStore } from "@/lib/store";
import { chat, getConfig, type ConfigResponse } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  isTyping?: boolean;
}

export default function ChatInterface() {
  const navigate = useNavigate();
  const selectedDocument = useAppStore((state) => state.selectedDocument);
  const config = useAppStore((state) => state.config);
  const setConfig = useAppStore((state) => state.setConfig);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: selectedDocument 
        ? `Hello! I'm ready to help you with "${selectedDocument.filename}". Ask me anything about this document and I'll retrieve relevant information with source citations.`
        : "Hello! Please select a document from the Documents page to start chatting. I'll help you find information within your uploaded documents.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<"openai" | "huggingface">(config.defaultProvider);
  const [model, setModel] = useState(config.defaultModel);
  const [topK, setTopK] = useState([config.defaultTopK]);
  const [showSettings, setShowSettings] = useState(false);
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(true);
  const [apiKey, setApiKey] = useState(
    config.defaultProvider === "openai" ? config.openaiKey : config.huggingfaceKey
  );
  const [backendConfig, setBackendConfig] = useState<ConfigResponse | null>(null);
  const [lastSources, setLastSources] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch backend config for available models
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const cfg = await getConfig();
        setBackendConfig(cfg);
      } catch (error) {
        console.warn("Failed to fetch backend config:", error);
      }
    };
    fetchConfig();
  }, []);

  // Update API key when provider changes
  useEffect(() => {
    setApiKey(provider === "openai" ? config.openaiKey : config.huggingfaceKey);
    // Update model to first available for the provider
    if (backendConfig) {
      const models = backendConfig.llm_models[provider];
      if (models && models.length > 0) {
        setModel(models[0].name);
      }
    }
  }, [provider, config, backendConfig]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Validate requirements
    if (!selectedDocument) {
      toast.error("Please select a document first");
      return;
    }

    if (!apiKey.trim()) {
      toast.error(`Please enter your ${provider === "openai" ? "OpenAI" : "HuggingFace"} API key`);
      setShowSettings(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = input.trim();
    setInput("");
    setIsLoading(true);

    // Show typing indicator
    const typingMessage: Message = {
      id: "typing",
      role: "assistant",
      content: "",
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const response = await chat({
        document_id: selectedDocument.document_id,
        query,
        top_k: topK[0],
        provider,
        llm_model: model,
        api_key: apiKey,
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        sources: response.sources,
      };

      setMessages((prev) => prev.filter((m) => m.id !== "typing").concat(aiResponse));
      setLastSources(response.sources);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get response";
      setMessages((prev) => prev.filter((m) => m.id !== "typing"));
      toast.error(errorMessage);
      
      // Add error message to chat
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${errorMessage}. Please check your API key and try again.`,
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">Document Chat</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedDocument ? selectedDocument.filename : "No document selected"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!selectedDocument && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard/documents")}
              >
                <FileText className="w-4 h-4 mr-2" />
                Select Document
              </Button>
            )}
            {/* Model Settings Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className={cn(showSettings && "bg-secondary")}
            >
              <Sliders className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKnowledgePanel(!showKnowledgePanel)}
              className={cn("hidden lg:flex", showKnowledgePanel && "bg-secondary")}
            >
              <Info className="w-4 h-4 mr-2" />
              Knowledge
            </Button>
          </div>
        </div>

        {/* Settings Bar */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-border overflow-hidden"
            >
              <div className="p-4 flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Provider:</span>
                  <Select value={provider} onValueChange={(v) => setProvider(v as "openai" | "huggingface")}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(backendConfig?.supported_providers || ["openai", "huggingface"]).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p === "openai" ? "OpenAI" : "HuggingFace"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Model:</span>
                  <div className="relative">
                    <Input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      list="llm-models"
                      placeholder="Type or select model..."
                      className="w-[260px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                    <datalist id="llm-models">
                      {(backendConfig?.llm_models[provider] || []).map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.description}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="flex items-center gap-2 min-w-[200px]">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Top K:</span>
                  <Slider
                    value={topK}
                    onValueChange={setTopK}
                    min={1}
                    max={20}
                    step={1}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-6">{topK[0]}</span>
                </div>

                <div className="flex items-center gap-2 flex-1 min-w-[250px]">
                  <Key className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="password"
                    placeholder={`${provider === "openai" ? "OpenAI" : "HuggingFace"} API Key`}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      // Save to store for persistence
                      if (provider === "openai") {
                        setConfig({ openaiKey: e.target.value });
                      } else {
                        setConfig({ huggingfaceKey: e.target.value });
                      }
                    }}
                    className={cn("flex-1", !apiKey && "border-orange-500")}
                  />
                  {!apiKey && (
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-6 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl w-full mx-auto space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    "flex w-full",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-3 text-left",
                      message.role === "user"
                        ? "chat-bubble-user ml-auto"
                        : "chat-bubble-ai mr-auto"
                    )}
                  >
                    {message.isTyping ? (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse-soft" />
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse-soft [animation-delay:0.2s]" />
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse-soft [animation-delay:0.4s]" />
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <Collapsible className="mt-4">
                            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity">
                              <FileText className="w-4 h-4" />
                              View {message.sources.length} sources
                              <ChevronDown className="w-4 h-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-3 space-y-2">
                              {message.sources.map((source, index) => (
                                <div
                                  key={index}
                                  className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                      Source {index + 1}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                                    {source}
                                  </p>
                                </div>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        )}

                        {/* Message Actions */}
                        {message.role === "assistant" && !message.isTyping && (
                          <div className="flex items-center gap-2 mt-3 opacity-50 hover:opacity-100 transition-opacity">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <Copy className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Regenerate</TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
          <div className="max-w-4xl w-full mx-auto">
            <div className="relative flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about your document..."
                  rows={1}
                  className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none input-focus min-h-[48px] max-h-32"
                  style={{ height: "auto" }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 bottom-2 h-8 w-8 text-gray-500 dark:text-gray-400"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-12 w-12 rounded-xl gradient-bg text-white hover:opacity-90 glow-primary"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* Knowledge Panel */}
      <AnimatePresence>
        {showKnowledgePanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:flex flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
          >
            <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Knowledge Panel</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowKnowledgePanel(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {/* Document Info */}
                {selectedDocument ? (
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate text-gray-900 dark:text-white">{selectedDocument.filename}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Active Document</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Chunks</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedDocument.num_chunks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Embedding Model</span>
                        <span className="font-medium text-xs truncate max-w-[120px] text-gray-900 dark:text-white">
                          {selectedDocument.embedding_model.split("/").pop()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Document ID</span>
                        <span className="font-mono text-xs truncate max-w-[100px] text-gray-900 dark:text-white">
                          {selectedDocument.document_id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card rounded-xl p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">No document selected</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => navigate("/dashboard/documents")}
                    >
                      Select Document
                    </Button>
                  </div>
                )}

                {/* Retrieved Chunks Preview */}
                {lastSources.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Latest Retrieved Chunks</h4>
                    <div className="space-y-2">
                      {lastSources.slice(0, 3).map((source, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                              Source {index + 1}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-3">
                            {source}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Settings */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Current Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Provider</span>
                      <span className="font-medium text-gray-900 dark:text-white">{provider === "openai" ? "OpenAI" : "HuggingFace"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Model</span>
                      <span className="font-medium text-xs truncate max-w-[120px] text-gray-900 dark:text-white">{model.split("/").pop()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Top K</span>
                      <span className="font-medium text-gray-900 dark:text-white">{topK[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">API Key</span>
                      <span className={cn("font-medium", apiKey ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400")}>
                        {apiKey ? "Configured" : "Not set"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
