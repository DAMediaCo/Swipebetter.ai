import { useCallback, useState } from "react";
import { Camera, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onChange, maxImages = 5 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      
      const newImages: string[] = [];
      const remainingSlots = maxImages - images.length;
      
      for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          const base64 = await fileToBase64(file);
          newImages.push(base64);
        }
      }
      
      onChange([...images, ...newImages]);
    },
    [images, maxImages, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileChange(e.dataTransfer.files);
    },
    [handleFileChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeImage = useCallback(
    (index: number) => {
      onChange(images.filter((_, i) => i !== index));
    },
    [images, onChange]
  );

  return (
    <div className="space-y-4">
      <div
        className={`relative min-h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-colors cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        } ${images.length >= maxImages ? "opacity-50 pointer-events-none" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (images.length < maxImages) {
            document.getElementById("file-upload")?.click();
          }
        }}
        data-testid="dropzone-upload"
      >
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
          data-testid="input-file-upload"
        />
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            {isDragging ? (
              <Upload className="w-7 h-7 text-primary" />
            ) : (
              <Camera className="w-7 h-7 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-semibold">
              {isDragging ? "Drop images here" : "Upload Screenshots"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag & drop or tap to select ({images.length}/{maxImages})
            </p>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative group aspect-[4/5] rounded-lg overflow-hidden bg-muted">
              <img
                src={img}
                alt={`Screenshot ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                data-testid={`button-remove-image-${index}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Your screenshots are private and deleted after processing
      </p>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
