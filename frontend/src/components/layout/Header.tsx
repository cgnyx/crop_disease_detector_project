import { Leaf } from 'lucide-react';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
          <Leaf size={32} />
          <h1 className="text-2xl font-semibold tracking-tight">{APP_NAME}</h1>
        </Link>
        {/* Navigation items can be added here if needed */}
      </div>
    </header>
  );
}
