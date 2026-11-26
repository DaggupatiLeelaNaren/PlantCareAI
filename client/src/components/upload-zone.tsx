import { useCallback, useState } from "react";
import { Upload, Image, FolderOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  mode: 'single' | 'dataset';
  onUpload: (files: File[]) => void;
}

export function UploadZone({ mode, onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (mode === 'single' && fileArray.length > 1) {
      fileArray.splice(1);
    }

    setSelectedFiles(fileArray);

    const urls = fileArray.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  }, [mode]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  }, [processFiles]);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleAnalyze = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
    }
  };

  return (
    <div className="space-y-6">
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200",
          isDragging && "border-primary bg-primary/5 scale-[1.02]",
          selectedFiles.length === 0 && "hover-elevate"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className="block cursor-pointer">
          <div className="p-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full transition-colors",
                isDragging ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {mode === 'single' ? (
                  <Image className="h-8 w-8" />
                ) : (
                  <FolderOpen className="h-8 w-8" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                {mode === 'single' ? 'Upload Plant Image' : 'Upload Dataset'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {mode === 'single' 
                  ? 'Drag and drop a plant image here, or click to browse'
                  : 'Drag and drop multiple plant images or a folder here, or click to browse'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Upload className="h-4 w-4" />
              <span>Supports JPG, PNG, JPEG formats</span>
            </div>

            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple={mode === 'dataset'}
              onChange={handleFileSelect}
              data-testid={mode === 'single' ? 'input-single-image' : 'input-dataset'}
            />
          </div>
        </label>
      </Card>

      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">
              Selected {mode === 'single' ? 'Image' : 'Images'} ({selectedFiles.length})
            </h4>
            <Button
              onClick={() => {
                setSelectedFiles([]);
                previewUrls.forEach(url => URL.revokeObjectURL(url));
                setPreviewUrls([]);
              }}
              variant="ghost"
              size="sm"
              data-testid="button-clear-selection"
            >
              Clear All
            </Button>
          </div>

          <div className={cn(
            "grid gap-4",
            mode === 'single' ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          )}>
            {selectedFiles.map((file, index) => (
              <Card key={index} className="relative overflow-hidden group">
                <div className="aspect-square relative">
                  <img
                    src={previewUrls[index]}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover-elevate"
                    data-testid={`button-remove-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-3 border-t">
                  <p className="text-xs text-foreground font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleAnalyze}
              size="lg"
              className="min-w-48"
              data-testid="button-start-analysis"
            >
              <Upload className="mr-2 h-5 w-5" />
              {mode === 'single' ? 'Analyze Image' : `Analyze ${selectedFiles.length} Images`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
