import { motion } from "framer-motion";
import { 
  Sparkles, 
  ArrowLeft, 
  Github, 
  ExternalLink,
  Database,
  Cpu,
  FileText,
  MessageSquare,
  Zap,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const techStack = [
  { name: "React", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "TailwindCSS", category: "Frontend" },
  { name: "Framer Motion", category: "Frontend" },
  { name: "FastAPI", category: "Backend" },
  { name: "FAISS", category: "Vector DB" },
  { name: "Sentence Transformers", category: "Embeddings" },
  { name: "OpenAI", category: "LLM" },
  { name: "HuggingFace", category: "LLM" },
];

const architectureSteps = [
  {
    icon: FileText,
    title: "Document Upload",
    description: "PDF files are uploaded and text is extracted using PyPDF2",
  },
  {
    icon: Layers,
    title: "Text Chunking",
    description: "Text is split into overlapping chunks using tiktoken tokenizer",
  },
  {
    icon: Database,
    title: "Embedding Generation",
    description: "Chunks are converted to vectors using sentence-transformers",
  },
  {
    icon: Zap,
    title: "FAISS Indexing",
    description: "Vectors are stored in FAISS index for fast similarity search",
  },
  {
    icon: MessageSquare,
    title: "Query Processing",
    description: "User queries are embedded and matched with relevant chunks",
  },
  {
    icon: Cpu,
    title: "LLM Generation",
    description: "Retrieved context + query is sent to LLM for response generation",
  },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen mesh-gradient">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">DocuChat AI</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              variant="ghost"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </motion.div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        <div className="container max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Github className="w-4 h-4" />
              Open Source Project
            </div>
            <h1 className="text-4xl font-bold mb-4">About This Project</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A production-ready RAG (Retrieval-Augmented Generation) system for 
              intelligent document chat powered by FAISS vector search and modern LLMs.
            </p>
          </motion.div>

          {/* Architecture Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">
              System Architecture
            </h2>
            <div className="glass-card rounded-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {architectureSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="relative"
                  >
                    <div className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <step.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-medium mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    {index < architectureSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-border" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Tech Stack</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.03 }}
                  className="px-4 py-2 rounded-full glass-card border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <span className="font-medium">{tech.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {tech.category}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "PDF Upload & Processing",
                  description: "Extract text, chunk documents, and create FAISS embeddings automatically",
                },
                {
                  title: "Configurable Embedding Models",
                  description: "Choose from multiple sentence-transformers models for optimal performance",
                },
                {
                  title: "Multi-Provider LLM Support",
                  description: "Switch between OpenAI and HuggingFace models seamlessly",
                },
                {
                  title: "Vector Search",
                  description: "FAISS-based similarity search for relevant context retrieval",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="glass-card rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="glass-card rounded-2xl p-8 inline-block">
              <h3 className="text-xl font-bold mb-4">Ready to Get Started?</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="gradient-bg text-white border-0 hover:opacity-90"
                >
                  Try the Demo
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    View on GitHub
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium">DocuChat AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Sasi Web App. AI Powered Document Intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
