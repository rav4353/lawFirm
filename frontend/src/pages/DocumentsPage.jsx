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
  Search,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [docToDelete, setDocToDelete] = useState(null);

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
      toast.success("Document uploaded successfully");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
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

  const confirmDelete = async () => {
    if (!docToDelete) return;
    try {
      await documentService.remove(docToDelete);
      setDocuments((prev) => prev.filter((d) => d.id !== docToDelete));
      if (selectedDoc?.id === docToDelete) setSelectedDoc(null);
      toast.success("Document deleted successfully");
    } catch {
      toast.error("Failed to delete document.");
    } finally {
      setDocToDelete(null);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        ) : filteredDocs.length === 0 && documents.length > 0 ? (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight">Your Documents</h2>
                    <Badge variant="secondary" className="text-xs">
                      {documents.length} file{documents.length !== 1 ? "s" : ""}
                    </Badge>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                            type="search" 
                            placeholder="Search documents..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full sm:w-[250px] bg-card/40 border-border/50 focus-visible:ring-primary/20 transition-all rounded-full h-9"
                        />
                    </div>
                </div>
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-4 flex items-center justify-center rounded-full bg-muted/40 p-5 backdrop-blur-sm">
                <Search className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h2 className="text-xl font-bold tracking-tight mb-2">No results found</h2>
              <p className="text-sm text-muted-foreground">
                No documents match your search <span className="font-semibold text-foreground">"{searchQuery}"</span>.
              </p>
              <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2 text-primary">
                Clear search
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight">Your Documents</h2>
                    <Badge variant="secondary" className="text-xs">
                      {documents.length} file{documents.length !== 1 ? "s" : ""}
                    </Badge>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                            type="search" 
                            placeholder="Search documents..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full sm:w-[250px] bg-card/40 border-border/50 focus-visible:ring-primary/20 transition-all rounded-full h-9"
                        />
                    </div>
                </div>
            </div>

            {filteredDocs.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i + 1}
              >
                <Card className="group border-border/50 bg-card/40 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md hover:bg-card/60">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/10 transition-transform group-hover:scale-105">
                      <FileText className="h-6 w-6 text-orange-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">{doc.filename}</p>
                      <p className="mt-0.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {formatBytes(doc.size_bytes)} • {formatDate(doc.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => handleView(doc.id)}
                        disabled={viewLoading}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDocToDelete(doc.id)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone and extracted text will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
