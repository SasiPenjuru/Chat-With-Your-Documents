import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Key, 
  Save, 
  Eye, 
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { getConfig, type ConfigResponse } from "@/lib/api";

export default function ConfigPage() {
  const storeConfig = useAppStore((state) => state.config);
  const setStoreConfig = useAppStore((state) => state.setConfig);
  
  const [config, setConfig] = useState({
    openaiKey: storeConfig.openaiKey,
    huggingfaceKey: storeConfig.huggingfaceKey,
    defaultProvider: storeConfig.defaultProvider,
    defaultModel: storeConfig.defaultModel,
    defaultTopK: storeConfig.defaultTopK,
  });
  const [backendConfig, setBackendConfig] = useState<ConfigResponse | null>(null);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showHfKey, setShowHfKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [keyStatus, setKeyStatus] = useState<{
    openai?: "valid" | "invalid";
    huggingface?: "valid" | "invalid";
  }>({});

  // Fetch backend config
  useEffect(() => {
    const fetchBackendConfig = async () => {
      try {
        const cfg = await getConfig();
        setBackendConfig(cfg);
      } catch (error) {
        console.warn("Failed to fetch backend config:", error);
      }
    };
    fetchBackendConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to local store (persisted to localStorage)
      setStoreConfig({
        openaiKey: config.openaiKey,
        huggingfaceKey: config.huggingfaceKey,
        defaultProvider: config.defaultProvider as "openai" | "huggingface",
        defaultModel: config.defaultModel,
        defaultTopK: config.defaultTopK,
      });
      await new Promise((resolve) => setTimeout(resolve, 300));
      toast.success("Configuration saved successfully!");
    } catch {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const validateKey = async (provider: "openai" | "huggingface") => {
    const key = provider === "openai" ? config.openaiKey : config.huggingfaceKey;
    if (!key) {
      toast.error("Please enter an API key first");
      return;
    }

    // Basic validation - check key format
    let isValid = false;
    if (provider === "openai") {
      isValid = key.startsWith("sk-") && key.length > 20;
    } else {
      isValid = key.startsWith("hf_") && key.length > 10;
    }
    
    setKeyStatus((prev) => ({
      ...prev,
      [provider]: isValid ? "valid" : "invalid",
    }));

    if (isValid) {
      toast.success(`${provider === "openai" ? "OpenAI" : "HuggingFace"} API key validated!`);
    } else {
      toast.error("Invalid API key");
    }
  };

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-950">
      <div className="container max-w-3xl mx-auto py-8 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your LLM providers and API keys for document chat
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* API Keys Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">API Keys</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Securely store your LLM provider API keys
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* OpenAI Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="openai-key" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    OpenAI API Key
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Get your API key from platform.openai.com
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Get API Key
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="openai-key"
                      type={showOpenaiKey ? "text" : "password"}
                      value={config.openaiKey}
                      onChange={(e) =>
                        setConfig({ ...config, openaiKey: e.target.value })
                      }
                      placeholder="sk-..."
                      className={cn(
                        "pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white",
                        keyStatus.openai === "valid" && "border-green-500",
                        keyStatus.openai === "invalid" && "border-red-500"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {showOpenaiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => validateKey("openai")}
                    disabled={!config.openaiKey}
                  >
                    {keyStatus.openai === "valid" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : keyStatus.openai === "invalid" ? (
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    ) : (
                      "Validate"
                    )}
                  </Button>
                </div>
              </div>

              {/* HuggingFace Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hf-key" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    HuggingFace API Token
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Get your token from huggingface.co/settings/tokens
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Get Token
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="hf-key"
                      type={showHfKey ? "text" : "password"}
                      value={config.huggingfaceKey}
                      onChange={(e) =>
                        setConfig({ ...config, huggingfaceKey: e.target.value })
                      }
                      placeholder="hf_..."
                      className={cn(
                        "pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white",
                        keyStatus.huggingface === "valid" && "border-green-500",
                        keyStatus.huggingface === "invalid" && "border-red-500"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowHfKey(!showHfKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {showHfKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => validateKey("huggingface")}
                    disabled={!config.huggingfaceKey}
                  >
                    {keyStatus.huggingface === "valid" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : keyStatus.huggingface === "invalid" ? (
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    ) : (
                      "Validate"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Default Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-6"
          >
            <h2 className="font-semibold mb-6 text-gray-900 dark:text-white">Default Settings</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Default Provider</Label>
                  <Select
                    value={config.defaultProvider}
                    onValueChange={(value) => {
                      const models = backendConfig?.llm_models[value as "openai" | "huggingface"] || [];
                      setConfig({
                        ...config,
                        defaultProvider: value,
                        defaultModel: models.length > 0 ? models[0].name : "",
                      });
                    }}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(backendConfig?.supported_providers || ["openai", "huggingface"]).map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {provider === "openai" ? "OpenAI" : "HuggingFace"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Default Model</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={config.defaultModel}
                      onChange={(e) => setConfig({ ...config, defaultModel: e.target.value })}
                      list="default-llm-models"
                      placeholder="Type or select model..."
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                    <datalist id="default-llm-models">
                      {(backendConfig?.llm_models[config.defaultProvider as "openai" | "huggingface"] || []).map(
                        (model) => (
                          <option key={model.name} value={model.name}>
                            {model.description}
                          </option>
                        )
                      )}
                    </datalist>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700 dark:text-gray-300">Default Top K Results</Label>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {config.defaultTopK}
                  </span>
                </div>
                <Slider
                  value={[config.defaultTopK]}
                  onValueChange={([value]) =>
                    setConfig({ ...config, defaultTopK: value })
                  }
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Number of similar chunks to retrieve for context
                </p>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gradient-bg text-white border-0 hover:opacity-90"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
