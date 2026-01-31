import { useState } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Eye, 
  Plus,
  File,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: Date;
  size: string;
}

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const newDocs: Document[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type || "document",
      uploadedAt: new Date(),
      size: formatFileSize(file.size),
    }));

    setDocuments((prev) => [...prev, ...newDocs]);
    
    toast({
      title: "Documents uploaded",
      description: `${files.length} file(s) uploaded successfully.`,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    toast({
      title: "Document removed",
      description: "The document has been removed from your records.",
    });
  };

  const documentTypes = [
    { label: "Prescriptions", icon: FileText, color: "text-primary" },
    { label: "Lab Reports", icon: File, color: "text-accent" },
    { label: "Medical History", icon: AlertCircle, color: "text-yellow-600" },
    { label: "Insurance", icon: CheckCircle, color: "text-green-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Your <span className="gradient-text">Medical Documents</span>
            </h1>
            <p className="text-muted-foreground">
              Upload and manage your medical records. These will be used as context 
              for accurate medical translations.
            </p>
          </div>

          {/* Document Types */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
            {documentTypes.map((type) => (
              <Card key={type.label} className="p-4 text-center hover:shadow-card transition-shadow cursor-pointer">
                <type.icon className={`w-8 h-8 ${type.color} mx-auto mb-2`} />
                <span className="text-sm font-medium text-foreground">{type.label}</span>
              </Card>
            ))}
          </div>

          {/* Upload Area */}
          <div className="max-w-3xl mx-auto mb-12">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                ${isDragging 
                  ? "border-primary bg-primary/5 scale-[1.02]" 
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
                }
              `}
            >
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              />
              
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Upload className={`w-8 h-8 ${isDragging ? "text-primary animate-bounce" : "text-primary"}`} />
              </div>
              
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {isDragging ? "Drop your files here" : "Upload Medical Documents"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supported: PDF, DOC, DOCX, JPG, PNG, TXT (Max 10MB each)
              </p>
            </div>
          </div>

          {/* Documents List */}
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Uploaded Documents ({documents.length})
              </h2>
              {documents.length > 0 && (
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add More
                </Button>
              )}
            </div>

            {documents.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">No documents yet</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your medical records to get started with context-aware translations.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-4 flex items-center gap-4 hover:shadow-card transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-foreground truncate">{doc.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {doc.size} • Uploaded {doc.uploadedAt.toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Documents;
