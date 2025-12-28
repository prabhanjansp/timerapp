const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
    if ('serviceWorker' in navigator) {
        // Always try to register in production
        if (process.env.NODE_ENV === 'production') {
            registerValidSW(config);
        } else if (isLocalhost) {
            // For localhost, still register for testing
            registerValidSW(config);
        }
    }
}

function registerValidSW(config) {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

    console.log('[Service Worker] Registering with URL:', swUrl);

    navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
            console.log('[Service Worker] Registration successful with scope:', registration.scope);

            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker == null) {
                    return;
                }

                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            console.log('[Service Worker] New content is available; please refresh.');
                            if (config && config.onUpdate) {
                                config.onUpdate(registration);
                            }
                        } else {
                            console.log('[Service Worker] Content is cached for offline use.');
                            if (config && config.onSuccess) {
                                config.onSuccess(registration);
                            }
                        }
                    }
                };
            };

            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'APP_INSTALLED') {
                    console.log('[Service Worker] App installed message received');
                    // You can trigger a UI update here
                }
            });
        })
        .catch((error) => {
            console.error('[Service Worker] Registration failed:', error);
            // Don't throw error, just log it
            if (config && config.onError) {
                config.onError(error);
            }
        });
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                console.error(error.message);
            });
    }
}

// Helper function to check if PWA is installable
export function isPwaInstallable() {
    return 'serviceWorker' in navigator && window.matchMedia('(display-mode: standalone)').matches === false;
}

// Helper to trigger install prompt
export function triggerInstallPrompt() {
    return new Promise((resolve, reject) => {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            window.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                    resolve(true);
                } else {
                    console.log('User dismissed the install prompt');
                    resolve(false);
                }
                window.deferredPrompt = null;
            });
        } else {
            resolve(false);
        }
    });
}