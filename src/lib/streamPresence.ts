import { sendStreamPing, type StreamPingPayload } from '@/lib/api/handlers/stream';
import { getRegisteredFolder } from '@/lib/folders';
import { useMailStore } from '@/stores/useMailStore';

export const PING_INTERVAL_MS = 20_000;
const FOLDER_CHANGE_DEBOUNCE_MS = 250;

export interface StreamPresenceOptions {
  intervalMs?: number;
  send?: (payload: StreamPingPayload) => Promise<void>;
}

export interface StreamPresenceHandle {
  stop: () => void;
  pingNow: () => void;
}

const isVisible = (): boolean => typeof document === 'undefined' || document.visibilityState !== 'hidden';

const isOnline = (): boolean => typeof navigator === 'undefined' || navigator.onLine !== false;

const openFolderPath = (): string | null => {
  const { selectedFolderId } = useMailStore.getState();
  return getRegisteredFolder(selectedFolderId)?.fullName ?? null;
};

let current: StreamPresenceHandle | null = null;

export function pingStreamPresence(): void {
  current?.pingNow();
}

export function startStreamPresence(options: StreamPresenceOptions = {}): StreamPresenceHandle {
  const send = options.send ?? sendStreamPing;
  const intervalMs = options.intervalMs ?? PING_INTERVAL_MS;
  let stopped = false;
  let debounce: ReturnType<typeof setTimeout> | null = null;

  const pingNow = () => {
    if (stopped || !isOnline()) return;
    void send({ visible: isVisible(), folder: openFolderPath() }).catch(() => undefined);
  };

  const onVisibility = () => pingNow();

  const unsubscribeStore = useMailStore.subscribe((state, previous) => {
    if (state.selectedFolderId === previous.selectedFolderId) return;
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
      debounce = null;
      pingNow();
    }, FOLDER_CHANGE_DEBOUNCE_MS);
  });

  const timer = setInterval(pingNow, intervalMs);

  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility);
  if (typeof window !== 'undefined') {
    window.addEventListener('online', onVisibility);
    window.addEventListener('focus', onVisibility);
  }

  pingNow();

  const handle: StreamPresenceHandle = {
    pingNow,
    stop: () => {
      stopped = true;
      clearInterval(timer);
      if (debounce) clearTimeout(debounce);
      unsubscribeStore();
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility);
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', onVisibility);
        window.removeEventListener('focus', onVisibility);
      }
      if (current === handle) current = null;
    },
  };

  current = handle;
  return handle;
}
