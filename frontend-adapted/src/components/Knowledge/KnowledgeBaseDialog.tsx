import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Download, Upload, BookOpen, Trash2, Loader2, Database } from "lucide-react";
import { knowledgeAPI, KnowledgeDocument, SearchResult } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KnowledgeBaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { value: "general", label: "Général" },
  { value: "code_penal", label: "Code Pénal" },
  { value: "code_civil", label: "Code Civil" },
  { value: "code_travail", label: "Code du Travail" },
  { value: "code_commerce", label: "Code de Commerce" },
  { value: "code_famille", label: "Code de la Famille" },
  { value: "jurisprudence", label: "Jurisprudence" },
  { value: "doctrine", label: "Doctrine" },
];

const KnowledgeBaseDialog = ({ open, onOpenChange }: KnowledgeBaseDialogProps) => {
  const [activeTab, setActiveTab] = useState("documents");
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCategory, setUploadCategory] = useState("general");
  const [uploading, setUploading] = useState(false);

  // Charger les documents
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await knowledgeAPI.listDocuments();
      setDocuments(response.documents);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors du chargement des documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les documents au montage
  useEffect(() => {
    if (open) {
      loadDocuments();
    }
  }, [open]);

  // Upload de document
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      await knowledgeAPI.uploadDocument(uploadFile, {
        title: uploadTitle || uploadFile.name,
        description: uploadDescription,
        category: uploadCategory,
      });

      toast({
        title: "Succès",
        description: "Document ajouté à la base de connaissance",
      });

      // Reset form
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      setUploadCategory("general");

      // Reload documents
      await loadDocuments();
      setActiveTab("documents");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de l'upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Recherche
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un terme de recherche",
        variant: "destructive",
      });
      return;
    }

    try {
      setSearching(true);
      const response = await knowledgeAPI.search(searchQuery, 10);
      setSearchResults(response.results);
      setActiveTab("search");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de la recherche",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  // Supprimer un document
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      return;
    }

    try {
      await knowledgeAPI.deleteDocument(id);
      toast({
        title: "Succès",
        description: "Document supprimé",
      });
      await loadDocuments();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de la suppression",
        variant: "destructive",
      });
    }
  };

  // Télécharger un document
  const handleDownload = async (id: string, filename: string) => {
    try {
      const blob = await knowledgeAPI.downloadDocument(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors du téléchargement",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Database className="h-5 w-5" />
            Base de connaissances (RAG)
          </DialogTitle>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher dans vos documents juridiques..."
              className="w-full pl-9 pr-24"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1"
              disabled={searching}
            >
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rechercher"}
            </Button>
          </form>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Ajouter
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Résultats ({searchResults.length})
            </TabsTrigger>
          </TabsList>

          {/* Documents List */}
          <TabsContent value="documents" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[450px] pr-4">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun document dans votre base de connaissance</p>
                  <p className="text-sm mt-2">Ajoutez des documents pour améliorer les réponses de l'IA</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Taille</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{doc.title}</div>
                            {doc.description && (
                              <div className="text-xs text-muted-foreground">{doc.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {categories.find((c) => c.value === doc.category)?.label || doc.category}
                          </span>
                        </TableCell>
                        <TableCell>{formatFileSize(doc.size)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(doc.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(doc.id, doc.originalName)}
                              title="Télécharger"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(doc.id, doc.title)}
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Upload Form */}
          <TabsContent value="upload" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[450px] pr-4">
              <form onSubmit={handleUpload} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Fichier *</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Formats acceptés : PDF, TXT, DOC, DOCX (max 10MB)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    placeholder="Nom du document (optionnel)"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description du contenu (optionnel)"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={uploadCategory} onValueChange={setUploadCategory}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={uploading || !uploadFile}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Ajouter à la base de connaissance
                    </>
                  )}
                </Button>
              </form>
            </ScrollArea>
          </TabsContent>

          {/* Search Results */}
          <TabsContent value="search" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[450px] pr-4">
              {searchResults.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun résultat</p>
                  <p className="text-sm mt-2">Effectuez une recherche pour trouver des documents pertinents</p>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <div className="text-sm text-muted-foreground mb-4">
                    {searchResults.length} résultat(s) trouvé(s) pour "{searchQuery}"
                  </div>
                  {searchResults.map((result, index) => (
                    <div key={result.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{result.filename}</span>
                            <span className="text-xs text-muted-foreground">
                              (Score: {(result.score * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Chunk #{result.chunkIndex + 1}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm bg-slate-50 p-3 rounded border">
                        {result.text.substring(0, 300)}
                        {result.text.length > 300 && "..."}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground mt-2 italic border-t pt-2">
          💡 Les documents ajoutés ici sont utilisés par l'IA pour enrichir ses réponses avec votre propre base de connaissance juridique.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeBaseDialog;
