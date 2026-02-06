import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Brain, 
  MessageSquare, 
  Search, 
  ArrowRight,
  Sparkles,
  Zap,
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const features = [
  {
    icon: FileText,
    title: "Upload PDFs",
    description: "Drag and drop your documents for instant processing and intelligent text extraction",
  },
  {
    icon: Brain,
    title: "Smart Embeddings",
    description: "Choose from multiple embedding models to create semantic vector representations",
  },
  {
    icon: MessageSquare,
    title: "Multi-LLM Chat",
    description: "Switch between OpenAI and HuggingFace models for diverse AI responses",
  },
  {
    icon: Search,
    title: "Vector Search",
    description: "FAISS-powered similarity search retrieves the most relevant context instantly",
  },
];

const stats = [
  { value: "10x", label: "Faster Research" },
  { value: "99%", label: "Accuracy" },
  { value: "100+", label: "File Types" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen mesh-gradient overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-gray-900 dark:text-white">DocuChat AI</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <ThemeToggle />
            <Button 
              variant="ghost" 
              className="hidden sm:flex text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
            <Button 
              onClick={() => navigate("/dashboard")}
              className="gradient-bg text-white border-0 hover:opacity-90 glow-primary font-medium"
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6 border border-indigo-200 dark:border-indigo-800"
            >
              <Zap className="w-4 h-4" />
              Powered by RAG + FAISS Technology
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900 dark:text-white"
            >
              Chat With Your Documents
              <br />
              <span className="gradient-text drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]">Using AI</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed"
            >
              Transform your documents into intelligent conversations. Upload PDFs, 
              create embeddings with FAISS, and get instant, accurate answers from 
              your knowledge base.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button 
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="gradient-bg text-white border-0 hover:opacity-90 glow-primary px-8 h-12 text-base font-semibold"
              >
                Start Chatting With Documents
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/about")}
                className="h-12 px-8 text-base font-medium border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                View Architecture
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center justify-center gap-8 sm:gap-16 mt-12"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 gradient-bg opacity-20 blur-3xl rounded-full" />
            <div className="relative glass-card rounded-2xl p-2 shadow-2xl">
              <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                {/* Mock Chat Interface Preview */}
                <div className="flex">
                  {/* Sidebar Preview */}
                  <div className="hidden md:flex w-64 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-800 p-4 flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg gradient-bg" />
                      <span className="font-medium text-sm text-gray-900 dark:text-white">DocuChat AI</span>
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      <div className="h-8 w-full rounded-lg bg-gray-200/60 dark:bg-gray-700/60 animate-pulse" />
                      <div className="h-8 w-full rounded-lg bg-gray-200/40 dark:bg-gray-700/40 animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Chat Preview */}
                  <div className="flex-1 p-6 min-h-[400px] flex flex-col">
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-end">
                        <div className="chat-bubble-user px-4 py-3 max-w-xs">
                          What are the key findings?
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="chat-bubble-ai px-4 py-3 max-w-md">
                          <p className="mb-2 font-medium">Based on the document, here are the key findings:</p>
                          <ul className="list-disc list-inside text-sm space-y-1 text-gray-700 dark:text-gray-300">
                            <li>Vector search improves accuracy by 40%</li>
                            <li>FAISS enables sub-second queries</li>
                            <li>Multi-model support enhances flexibility</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <div className="flex-1 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
                      <div className="w-12 h-12 rounded-xl gradient-bg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Everything You Need for
              <span className="gradient-text"> Document Intelligence</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              A complete RAG pipeline with enterprise-grade features for document understanding
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Built With Modern Technology
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Production-ready stack designed for performance and scalability
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {["React", "TypeScript", "TailwindCSS", "FastAPI", "FAISS", "Sentence Transformers", "OpenAI", "HuggingFace"].map((tech, index) => (
              <div
                key={index}
                className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors border border-gray-200 dark:border-gray-700"
              >
                {tech}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 gradient-bg opacity-5 dark:opacity-10" />
            <div className="relative">
              <Shield className="w-12 h-12 mx-auto mb-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Ready to Transform Your Documents?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-xl mx-auto mb-8">
                Start chatting with your PDFs today. No credit card required.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="gradient-bg text-white border-0 hover:opacity-90 glow-primary px-8 h-12 text-base font-semibold"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">DocuChat AI</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2024 DocuChat AI. Built with RAG + FAISS.
          </p>
        </div>
      </footer>
    </div>
  );
}
