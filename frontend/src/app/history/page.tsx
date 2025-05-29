import { Header } from '@/components/layout/Header';
import { ScanHistoryClientPage } from '@/components/history/ScanHistoryClientPage';

export default function HistoryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <ScanHistoryClientPage />
      </main>
       <footer className="text-center py-6 text-sm text-muted-foreground border-t">
        &copy; {new Date().getFullYear()} Krishi Rakshak.
      </footer>
    </div>
  );
}
