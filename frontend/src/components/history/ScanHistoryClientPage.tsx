'use client';

import { useState, useEffect } from 'react';
import type { ScanHistoryItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { AlertTriangle, CalendarDays, Info, ListCollapse, Recycle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';

export function ScanHistoryClientPage() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedHistory = localStorage.getItem('scanHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('scanHistory');
    setHistory([]);
  };
  
  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <ListCollapse className="h-12 w-12 animate-pulse text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-primary tracking-tight">Scan History (ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ)</h2>
        {history.length > 0 && (
          <Button variant="destructive" onClick={clearHistory} size="sm">
            <Recycle className="mr-2 h-4 w-4" /> Clear History
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-accent" />
              No Scan History Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You haven&apos;t performed any crop disease detections yet. Go back to the homepage to start analyzing your crops.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-250px)]"> {/* Adjust height as needed */}
          <Accordion type="single" collapsible className="w-full space-y-3">
            {history.map((item) => (
              <AccordionItem value={item.id} key={item.id} className="bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                    <div className="font-medium text-lg text-foreground">
                      {item.cropType.charAt(0).toUpperCase() + item.cropType.slice(1)} Scan
                       {item.diseaseName && <Badge variant="secondary" className="ml-2">{item.diseaseName}</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <CalendarDays className="h-4 w-4 mr-1.5" />
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0">
                  <div className="space-y-3 text-sm">
                    {item.diseaseName && item.confidence !== undefined && (
                      <p><strong>Initial Detection:</strong> {item.diseaseName} ({(item.confidence * 100).toFixed(0)}% confidence)</p>
                    )}
                    <div className="p-3 bg-accent/10 rounded-md border border-accent/20">
                      <p className="font-semibold text-accent-foreground flex items-center mb-1">
                        <Info className="h-4 w-4 mr-1.5" /> AI Suggestion:
                      </p>
                      <p className="text-foreground/90">{item.aiSuggestion}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      )}
    </div>
  );
}
