'use client';

import { useState, useEffect, useCallback, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Camera, UploadCloud, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface ImageUploaderProps {
  onImageUpload: (file: File | null) => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageUpload, disabled }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      setFileName(file.name);
      onImageUpload(file);
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setFileName(null);
      onImageUpload(null);
    }
  }, [onImageUpload, previewUrl]);

  const clearImage = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileName(null);
    onImageUpload(null);
    // Reset file input
    const fileInput = document.getElementById('plant-image-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, [onImageUpload, previewUrl]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="w-full max-w-md space-y-2">
      <Label htmlFor="plant-image-input" className="text-lg font-medium">Upload Leaf Image (ಎಲೆ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ)</Label>
      <Card className="border-dashed border-2 hover:border-primary transition-colors">
        <CardContent className="p-4">
          {previewUrl ? (
            <div className="space-y-3">
              <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                <Image src={previewUrl} alt="Uploaded plant image" layout="fill" objectFit="contain" />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate" title={fileName || "Uploaded image"}>{fileName || "Uploaded image"}</p>
                <Button variant="ghost" size="sm" onClick={clearImage} aria-label="Remove image" disabled={disabled}>
                  <XCircle className="mr-1 h-4 w-4" /> Clear
                </Button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="plant-image-input"
              className={`flex flex-col items-center justify-center p-6 space-y-2 rounded-md cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/10'}`}
            >
              <UploadCloud className="h-12 w-12 text-gray-400" />
              <p className="text-center text-muted-foreground">
                Click to browse or drag & drop image here.
              </p>
              <Input
                id="plant-image-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
              />
              <Button type="button" variant="outline" size="sm" className="mt-2 pointer-events-none" tabIndex={-1} disabled={disabled}>
                <Camera className="mr-2 h-4 w-4" /> Select Image
              </Button>
            </label>
          )}
        </CardContent>
      </Card>
       <p className="text-xs text-muted-foreground text-center pt-1">
        Please upload a clear, close-up image of the affected plant leaf.
      </p>
    </div>
  );
}
