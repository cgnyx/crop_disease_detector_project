'use client';

import Image from 'next/image';
import type { DetectionResultData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Info, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ResultDisplayProps {
  result: DetectionResultData;
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader>
        <div className="flex items-center space-x-2 text-accent">
          <Sparkles className="h-6 w-6" />
          <CardTitle className="text-2xl">AI Analysis Complete</CardTitle>
        </div>
        {result.diseaseName && result.confidence !== undefined && (
           <CardDescription className="pt-1">
            Initial low-confidence detection: <Badge variant="secondary">{result.diseaseName} ({ (result.confidence * 100).toFixed(0) }% confidence)</Badge>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
            <Info className="h-5 w-5 mr-2 text-primary" />
            AI Suggestion & Guidance:
          </h3>
          <p className="text-foreground/90 leading-relaxed p-3 bg-accent/10 rounded-md border border-accent/30">
            {result.aiSuggestion}
          </p>
        </div>

        {result.images && result.images.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Example Images (ಉದಾಹರಣೆ ಚಿತ್ರಗಳು)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.images.map((img, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden border shadow-sm">
                  <Image 
                    src={img.src} 
                    alt={img.alt} 
                    layout="fill" 
                    objectFit="cover" 
                    data-ai-hint={img.hint}
                  />
                   <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1 text-xs text-center">
                    {img.alt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Separator />

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Basic Treatment Advice (ಚಿಕಿತ್ಸೆಯ ಸಲಹೆ)</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{result.treatment}</p>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 rounded-b-lg">
        <div className="flex items-start space-x-2 text-sm text-muted-foreground">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <p>{result.disclaimer}</p>
        </div>
      </CardFooter>
    </Card>
  );
}
