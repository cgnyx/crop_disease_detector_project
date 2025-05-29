'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { CropSelector } from '@/components/home/CropSelector';
import { ImageUploader } from '@/components/home/ImageUploader';
import { ResultDisplay } from '@/components/home/ResultDisplay';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, History, ScanLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAIDrivenSuggestion, performDiseaseDetection } from './actions'; // Updated imports
import type { DiseaseDetectionInput, DiseaseDetectionOutput } from './actions'; // Updated imports

import type { DetectionResultData, ScanHistoryItem } from '@/lib/types';
import { CROP_OPTIONS, MOCK_DISEASES, TREATMENT_ADVICE, DISEASE_DISCLAIMER, IMAGE_DESCRIPTION_FOR_AI } from '@/lib/constants';
import type { ReasonAboutLowConfidenceInput } from '@/ai/flows/reason-about-low-confidence';
import { fileToDataUri } from '@/lib/utils'; // New import

export default function HomePage() {
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResultData | null>(null);
  const { toast } = useToast();

  const handleImageUpload = useCallback((file: File | null) => {
    setImageFile(file);
    setDetectionResult(null);
    setError(null);
  }, []);

  const handleCropChange = useCallback((cropValue: string) => {
    setSelectedCrop(cropValue);
    setDetectionResult(null);
    setError(null);
  }, []);

  const handleDetectDisease = async () => {
    if (!selectedCrop || !imageFile) {
      setError("Please select a crop and upload an image.");
      toast({
        title: "Missing Information",
        description: "Please select a crop and upload an image before detection.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setDetectionResult(null);

    try {
      // 1. Convert imageFile to data URI
      const imageDataUri = await fileToDataUri(imageFile);

      // 2. Call the new disease detection action (which simulates calling your model)
      const detectionInput: DiseaseDetectionInput = {
        imageDataUri,
        cropType: selectedCrop,
      };
      const modelDetectionResult: DiseaseDetectionOutput = await performDiseaseDetection(detectionInput);

      // 3. Use the model's output for the AI suggestion flow
      const aiInput: ReasonAboutLowConfidenceInput = {
        diseaseName: modelDetectionResult.diseaseName,
        confidence: modelDetectionResult.confidence,
        imageDescription: IMAGE_DESCRIPTION_FOR_AI, // This could also be dynamically generated or enhanced
        cropType: selectedCrop,
      };
      const aiOutput = await getAIDrivenSuggestion(aiInput);

      // 4. Construct the final result for display
      // Note: MOCK_DISEASES[selectedCrop] is used here for example images hints.
      // In a real scenario, these might come from your model or a separate database.
      const mockDiseaseInfoForSelectedCrop = MOCK_DISEASES[selectedCrop];
      const imageHints = mockDiseaseInfoForSelectedCrop ? mockDiseaseInfoForSelectedCrop.imageHints : ["plant disease", "leaf analysis"];


      const resultData: DetectionResultData = {
        aiSuggestion: aiOutput.suggestion,
        diseaseName: modelDetectionResult.diseaseName,
        confidence: modelDetectionResult.confidence,
        images: imageHints.map((hint, i) => ({
          src: `https://placehold.co/300x200.png`, // Placeholder
          alt: `${modelDetectionResult.diseaseName} example ${i + 1}`,
          hint: hint,
        })),
        treatment: TREATMENT_ADVICE[selectedCrop] || TREATMENT_ADVICE.general,
        disclaimer: DISEASE_DISCLAIMER,
      };
      setDetectionResult(resultData);

      // Save to history
      const historyItem: ScanHistoryItem = {
        id: new Date().toISOString(),
        timestamp: Date.now(),
        cropType: selectedCrop,
        diseaseName: modelDetectionResult.diseaseName,
        confidence: modelDetectionResult.confidence,
        aiSuggestion: aiOutput.suggestion,
      };
      
      const storedHistory = localStorage.getItem('scanHistory');
      const history: ScanHistoryItem[] = storedHistory ? JSON.parse(storedHistory) : [];
      history.unshift(historyItem);
      localStorage.setItem('scanHistory', JSON.stringify(history.slice(0, 20))); // Limit history

      toast({
        title: "Detection Complete",
        description: "Analysis finished and results are displayed below. Scan saved to history.",
      });

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to detect disease: ${errorMessage}`);
      toast({
        title: "Detection Error",
        description: `An error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center space-y-8">
        <section className="w-full max-w-md text-center space-y-3">
          <h2 className="text-3xl font-bold text-primary tracking-tight">Crop Disease Detection</h2>
          <p className="text-muted-foreground text-lg">
            Upload an image of an affected plant leaf to get an AI-powered analysis.
          </p>
        </section>

        <CropSelector
          options={CROP_OPTIONS}
          selectedCrop={selectedCrop}
          onCropChange={handleCropChange}
          disabled={isLoading}
        />

        <ImageUploader onImageUpload={handleImageUpload} disabled={isLoading} />
        
        <Button
          onClick={handleDetectDisease}
          disabled={isLoading || !selectedCrop || !imageFile}
          size="lg"
          className="w-full max-w-md h-14 text-lg bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          ) : (
            <ScanLine className="mr-2 h-6 w-6" />
          )}
          {isLoading ? 'Analyzing...' : 'Detect Disease (ರೋಗ ಪತ್ತೆ ಮಾಡಿ)'}
        </Button>

        {error && (
          <div className="w-full max-w-xl p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {isLoading && !error && (
          <div className="flex flex-col items-center space-y-2 pt-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing image, please wait...</p>
          </div>
        )}
        
        {detectionResult && !isLoading && (
          <section className="w-full mt-8">
            <ResultDisplay result={detectionResult} />
          </section>
        )}
        
        <div className="pt-8">
          <Link href="/history" passHref>
            <Button variant="outline" size="lg" className="text-base">
              <History className="mr-2 h-5 w-5" />
              View Scan History (ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ)
            </Button>
          </Link>
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-muted-foreground border-t">
        &copy; {new Date().getFullYear()} Krishi Rakshak. Helping farmers thrive.
      </footer>
    </div>
  );
}
