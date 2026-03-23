/* ============================================
   FILE: tabSync.ts
   PURPOSE: tabSync module
   DEPENDENCIES: None (local only)
   EXPORTS: initTabSync, closeTabSync
   ============================================ */
/**
 * FILE: tabSync.ts
 * PURPOSE: BroadcastChannel middleware for Zustand — sync state across browser tabs
 * DEPENDENCIES: zustand
 *
 * Per doctrine Part 11: "סנכרון בין טאבים"
 * When any tab updates the store, all other tabs update too.
 */

// #region Types

interface TabSyncOptions {
  /** Channel name — must match across tabs */
  channelName: string;
}

// #endregion

// #region Middleware

let channel: BroadcastChannel | null = null;
let ignoreNext = false;

/**
 * Initialize tab sync for brainStore.
 * Call this once on app startup (e.g. in main.tsx).
 *
 * @param getState — Store getState function
 * @param setState — Store setState function
 * @param options — Channel configuration
 */
export function initTabSync(
  getState: () => unknown,
  setState: (partial: unknown) => void,
  options: TabSyncOptions = { channelName: 'brain-store-sync' },
): void {
  if (typeof BroadcastChannel === 'undefined') return; // SSR safety

  channel = new BroadcastChannel(options.channelName);

  // Listen for state updates from other tabs
  channel.onmessage = (event) => {
    if (event.data?.type === 'STATE_UPDATE') {
      ignoreNext = true;
      setState(event.data.state);
    }
  };

  // Subscribe to local state changes and broadcast
  const originalState = getState();
  let prevState = originalState;

  // Poll for changes every 500ms (lightweight)
  setInterval(() => {
    const currentState = getState();
    if (currentState !== prevState && !ignoreNext) {
      try {
        // JSON round-trip strips functions and other non-cloneable values
        const serializable = JSON.parse(JSON.stringify(currentState));
        channel?.postMessage({
          type: 'STATE_UPDATE',
          state: serializable,
          tabId: getTabId(),
        });
      } catch {
        // State contains non-serializable data — skip this sync cycle
      }
    }
    prevState = currentState;
    ignoreNext = false;
  }, 500);
}

/** Get a unique tab identifier */
function getTabId(): string {
  let id = sessionStorage.getItem('brain_tab_id');
  if (!id) {
    id = `tab-${Date.now().toString(36)}`;
    sessionStorage.setItem('brain_tab_id', id);
  }
  return id;
}

/** Close the broadcast channel */
export function closeTabSync(): void {
  channel?.close();
  channel = null;
}

// #endregion
