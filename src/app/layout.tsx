import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
});

export const metadata: Metadata = {
  title: 'ResumeAI - AI-Powered Resume Analyzer',
  description: 'Analyze, optimize, and improve your resume with AI. Get ATS compatibility scores, keyword analysis, and personalized improvement suggestions.',
  keywords: ['resume analyzer', 'ATS checker', 'resume optimization', 'AI resume', 'job search'],
  authors: [{ name: 'ResumeAI' }],
  openGraph: {
    title: 'ResumeAI - AI-Powered Resume Analyzer',
    description: 'Analyze, optimize, and improve your resume with AI',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background bg-gradient-mesh">
        <div className="relative min-h-screen">
          {/* Ambient background effects */}
          <div className="fixed inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-secondary/5 rounded-full blur-3xl animate-pulse-slow animation-delay-200" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-info/3 rounded-full blur-3xl" />
          </div>
          
          {children}
        </div>
      </body>
    </html>
  );
}

