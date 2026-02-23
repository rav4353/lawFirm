import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { documentService } from "@/services/documents";
import { ThemeToggle } from "@/components/ThemeToggle";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Scale,
  Upload,
  FileText,
  Trash2,
  Eye,
  X,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CloudUpload,
  File,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function DocumentsPage() {
  const fileInputRef = useRef(null);


  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const data = await documentService.list();
      setDocuments(data.documents);
    } catch {
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      await documentService.upload(file);
      await fetchDocuments();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDelete = async (id) => {
    try {
      await documentService.remove(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedDoc?.id === id) setSelectedDoc(null);
    } catch {
      setError("Failed to delete document.");
    }
  };

  const handleView = async (id) => {
    setViewLoading(true);
    try {
      const doc = await documentService.get(id);
      setSelectedDoc(doc);
    } catch {
      setError("Failed to load document details.");
    } finally {
      setViewLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">Documents</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Badge variant="secondary" className="text-xs">
              {documents.length} file{documents.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
            <button
              className="ml-auto shrink-0"
              onClick={() => setError("")}
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* ── Upload zone ── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <Card
            className={`mb-8 border-2 border-dashed transition-colors cursor-pointer ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border/50 bg-card/60 hover:border-primary/40"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Uploading & extracting text…
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <CloudUpload className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">
                      Drop a PDF here or{" "}
                      <span className="text-primary underline underline-offset-4">
                        browse
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF files up to 10 MB • Text is extracted automatically
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Document list ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="flex flex-col items-center py-16 text-center"
          >
            <FileText className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              No documents yet
            </p>
            <p className="text-sm text-muted-foreground/70">
              Upload your first PDF to get started
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <h2 className="mb-2 text-lg font-semibold">Your Documents</h2>
            {documents.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i + 1}
              >
                <Card className="group border-border/50 bg-card/60 transition-all hover:border-primary/30 hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <File className="h-5 w-5 text-primary" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{doc.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(doc.size_bytes)} •{" "}
                        {formatDate(doc.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleView(doc.id)}
                        disabled={viewLoading}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Extracted text viewer (slide-in panel) ── */}
        {selectedDoc && (
          <motion.div
            className="fixed inset-0 z-50 flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              onClick={() => setSelectedDoc(null)}
            />

            {/* Panel */}
            <motion.div
              className="relative ml-auto flex h-full w-full max-w-2xl flex-col border-l border-border bg-background shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold">
                    {selectedDoc.filename}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(selectedDoc.size_bytes)} •{" "}
                    {formatDate(selectedDoc.created_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDoc(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-auto px-6 py-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Extracted Text
                </h4>
                {selectedDoc.extracted_text ? (
                  <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed">
                    {selectedDoc.extracted_text}
                  </pre>
                ) : (
                  <p className="text-sm italic text-muted-foreground">
                    No text could be extracted from this document.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
