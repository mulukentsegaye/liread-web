/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'pdfjs-dist/build/pdf.js' {
  const content: any;
  export = content;
}

declare module 'pdfjs-dist/build/pdf.worker.min.js?url' {
  const src: string;
  export default src;
}

declare module 'pdfjs-dist';
declare module 'pdfjs-dist/build/pdf.js';
declare module 'epubjs';
