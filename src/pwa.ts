// PWA Service Worker Registration
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Register on window load to avoid blocking initial critical page rendering
  window.addEventListener('load', () => {
    // Respect base path
    const swPath = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker
      .register(swPath)
      .then((registration) => {
        // Optional updates check
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) return;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                console.info('Physics Teacher Interactive: New content available, please refresh.');
              }
            }
          };
        };
      })
      .catch((error) => {
        console.warn('Physics Teacher Interactive Service Worker registration error:', error);
      });
  });
}
