'use client';

import type { CropOption } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface CropSelectorProps {
  options: CropOption[];
  selectedCrop: string | null;
  onCropChange: (value: string) => void;
  disabled?: boolean;
}

export function CropSelector({ options, selectedCrop, onCropChange, disabled }: CropSelectorProps) {
  return (
    <div className="w-full max-w-md space-y-2">
      <Label htmlFor="crop-select" className="text-lg font-medium">Select Crop (ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ)</Label>
      <Select
        value={selectedCrop ?? undefined}
        onValueChange={onCropChange}
        disabled={disabled}
      >
        <SelectTrigger id="crop-select" className="w-full text-base h-12">
          <SelectValue placeholder="Select a crop..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-base">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
