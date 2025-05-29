
export interface CropOption {
  value: string;
  label: string;
}

export interface DiseaseImage {
  src: string;
  alt: string;
  hint: string; // For data-ai-hint
}

export interface DetectionResultData {
  aiSuggestion: string;
  diseaseName?: string; // The initially mocked low-confidence disease
  confidence?: number; // The initially mocked low-confidence
  images: DiseaseImage[];
  treatment: string;
  disclaimer: string;
}

export interface ScanHistoryItem {
  id: string; // ISO string timestamp of detection
  timestamp: number; // Unix timestamp
  cropType: string;
  // Not storing image for web version due to localStorage limitations
  // imageUrl?: string; 
  diseaseName?: string; // Mocked initial disease
  confidence?: number; // Mocked initial confidence
  aiSuggestion: string;
}

export interface MockDiseaseInfo {
  name: string;
  confidence: number;
  imageHints: string[]; 
}
