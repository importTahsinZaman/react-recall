// Server-side log capture for react-recall
// Entry point for: import 'react-recall/server'

import { patchConsole, restoreConsole } from './console.js';

let initialized = false;

export function register(): void {
  // Only run in development
  if (process.env.NODE_ENV !== 'development') return;

  // Prevent double initialization
  if (initialized) return;
  initialized = true;

  const serverUrl = process.env.REACT_RECALL_SERVER || 'http://localhost:4312';

  patchConsole(serverUrl);

  // Log that we're connected (using original console would be cleaner but this works)
  console.log('[react-recall] Server log capture enabled');
}

// Export for manual control
export { restoreConsole };

// Auto-register on import
register();
