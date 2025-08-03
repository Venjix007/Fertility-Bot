// Minimal Deno type definitions for Supabase Edge Functions
interface RequestEvent {
  request: Request;
  respondWith(response: Response | Promise<Response>): Promise<void>;
}

declare const Deno: {
  // Core Deno types needed for Supabase Edge Functions
  env: {
    get(key: string): string | undefined;
    toObject(): { [key: string]: string };
  };
  
  // HTTP server types
  serve(handler: (req: Request) => Response | Promise<Response>): void;
  serve(addr: string | Deno.ServeInit, handler: (req: Request) => Response | Promise<Response>): void;
  
  // File system types (if needed)
  readTextFile(path: string | URL): Promise<string>;
  readTextFileSync(path: string | URL): string;
  
  // Other commonly used Deno APIs
  cwd(): string;
  exit(code?: number): never;
  
  // Add other Deno APIs as needed
};

declare namespace Deno {
  interface ServeInit {
    port?: number;
    hostname?: string;
    onListen?: (params: { hostname: string; port: number }) => void;
  }
  
  // Add other type definitions as needed
}

// Global Deno types
declare const Deno: typeof globalThis.Deno;
