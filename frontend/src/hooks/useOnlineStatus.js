import { useEffect, useState } from 'react';

// navigator.onLine only reports whether the device has a network interface,
// not whether the API is actually reachable — so this drives a warning
// banner, never any decision about whether saved data is trustworthy.
export default function useOnlineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
}
