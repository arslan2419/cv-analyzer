import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-accent-success';
  if (score >= 60) return 'text-accent-warning';
  return 'text-accent-danger';
}

/**
 * Get score background color based on value
 */
export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-accent-success';
  if (score >= 60) return 'bg-accent-warning';
  return 'bg-accent-danger';
}

/**
 * Get score gradient based on value
 */
export function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-emerald-500 to-emerald-400';
  if (score >= 60) return 'from-amber-500 to-amber-400';
  return 'from-red-500 to-red-400';
}

/**
 * Normalize skill name for comparison
 */
export function normalizeSkill(skill: string): string {
  const synonyms: Record<string, string> = {
    'reactjs': 'react',
    'react.js': 'react',
    'vuejs': 'vue',
    'vue.js': 'vue',
    'angularjs': 'angular',
    'angular.js': 'angular',
    'nodejs': 'node.js',
    'node': 'node.js',
    'expressjs': 'express',
    'express.js': 'express',
    'nextjs': 'next.js',
    'nuxtjs': 'nuxt.js',
    'postgresql': 'postgres',
    'mongodb': 'mongo',
    'javascript': 'js',
    'typescript': 'ts',
    'python3': 'python',
    'golang': 'go',
    'k8s': 'kubernetes',
    'gcp': 'google cloud',
    'aws': 'amazon web services',
    'ci/cd': 'cicd',
    'ci cd': 'cicd',
    'ml': 'machine learning',
    'ai': 'artificial intelligence',
    'dl': 'deep learning',
  };

  const normalized = skill.toLowerCase().trim();
  return synonyms[normalized] || normalized;
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string): string[] {
  // Remove common stop words
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
    'we', 'they', 'what', 'which', 'who', 'whom', 'their', 'our', 'your',
    'its', 'my', 'your', 'his', 'her', 'all', 'each', 'every', 'both', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there',
    'when', 'where', 'why', 'how', 'any', 'if', 'then', 'because', 'while',
    'although', 'though', 'after', 'before', 'during', 'until', 'unless',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s\-\.]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  // Count frequency
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Sort by frequency and return unique keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 50);
}

/**
 * Calculate text similarity using Jaccard index
 */
export function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const words1Arr = Array.from(words1);
  const words2Arr = Array.from(words2);
  const intersection = new Set(words1Arr.filter(x => words2.has(x)));
  const union = new Set(words1Arr.concat(words2Arr));

  return intersection.size / union.size;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts - 1) {
        await sleep(baseDelay * Math.pow(2, attempt));
      }
    }
  }
  
  throw lastError;
}

/**
 * Check if a string contains action verbs
 */
export function hasActionVerbs(text: string): boolean {
  const actionVerbs = [
    'achieved', 'accomplished', 'accelerated', 'acquired', 'adapted',
    'administered', 'advanced', 'analyzed', 'applied', 'architected',
    'automated', 'boosted', 'built', 'calculated', 'captured', 'championed',
    'collaborated', 'completed', 'conceived', 'conducted', 'consolidated',
    'constructed', 'contributed', 'converted', 'coordinated', 'created',
    'decreased', 'delivered', 'demonstrated', 'designed', 'developed',
    'devised', 'directed', 'discovered', 'documented', 'drove', 'earned',
    'eliminated', 'enabled', 'engineered', 'enhanced', 'established',
    'exceeded', 'executed', 'expanded', 'expedited', 'facilitated',
    'formulated', 'founded', 'generated', 'grew', 'headed', 'identified',
    'implemented', 'improved', 'increased', 'initiated', 'innovated',
    'integrated', 'introduced', 'invented', 'launched', 'led', 'leveraged',
    'maintained', 'managed', 'maximized', 'mentored', 'modernized',
    'negotiated', 'operated', 'optimized', 'orchestrated', 'organized',
    'outperformed', 'overhauled', 'oversaw', 'pioneered', 'planned',
    'prepared', 'presented', 'processed', 'produced', 'programmed',
    'promoted', 'proposed', 'provided', 'published', 'raised', 'reached',
    'realized', 'recommended', 'reconciled', 'redesigned', 'reduced',
    'refined', 'remodeled', 'reorganized', 'replaced', 'researched',
    'resolved', 'restored', 'restructured', 'revamped', 'reviewed',
    'revised', 'revolutionized', 'saved', 'scaled', 'secured', 'simplified',
    'solved', 'spearheaded', 'standardized', 'started', 'steered',
    'stimulated', 'streamlined', 'strengthened', 'structured', 'succeeded',
    'supervised', 'surpassed', 'sustained', 'synchronized', 'systematized',
    'targeted', 'trained', 'transformed', 'translated', 'unified', 'upgraded',
    'utilized', 'validated', 'verified', 'visualized', 'won', 'wrote',
  ];

  const words = text.toLowerCase().split(/\s+/);
  return words.some(word => actionVerbs.includes(word));
}

/**
 * Check if text contains quantified results
 */
export function hasQuantifiedResults(text: string): boolean {
  // Look for numbers, percentages, dollar amounts, time periods
  const patterns = [
    /\d+%/,
    /\$[\d,]+/,
    /\d+[kKmMbB]\+?/,
    /\d+\s*(users?|customers?|clients?|employees?|team members?)/i,
    /\d+\s*(projects?|applications?|systems?)/i,
    /increased?.*\d+/i,
    /reduced?.*\d+/i,
    /improved?.*\d+/i,
    /saved?.*\d+/i,
    /generated?.*\d+/i,
  ];

  return patterns.some(pattern => pattern.test(text));
}

