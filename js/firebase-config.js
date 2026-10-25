/**
 * Digital Wedding Invitation - Firebase Realtime Database Integration
 * Enables real-time synchronization of guest wishes across all mobile phones and browsers.
 */

const WeddingFirebase = (function () {
  // Default configuration (can be updated here or dynamically via Organizer Dashboard)
  const STORAGE_KEY = 'wedding_firebase_config';

  // Get active config: from localStorage or default template
  function getConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.databaseURL || parsed.apiKey)) {
          return parsed;
        }
      }
    } catch (e) {}

    // Default configuration template
    // Replace with your Firebase Realtime Database URL
    return {
      databaseURL: "https://wedding-invitation-tharaka-default-rtdb.firebaseio.com",
      projectId: "wedding-invitation-tharaka"
    };
  }

  function saveConfig(cfg) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
      return true;
    } catch (e) {
      return false;
    }
  }

  let dbInstance = null;
  let isInitialized = false;
  let connectionStatus = 'initializing'; // 'connected', 'fallback', 'disabled'

  function init() {
    if (typeof firebase === 'undefined') {
      console.warn('[WeddingFirebase] Firebase SDK not loaded, using local storage mode.');
      connectionStatus = 'disabled';
      return null;
    }

    const config = getConfig();
    if (!config || !config.databaseURL) {
      connectionStatus = 'fallback';
      return null;
    }

    try {
      // Check if already initialized
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      dbInstance = firebase.database();
      isInitialized = true;
      connectionStatus = 'connected';
      console.log('[WeddingFirebase] Connected to Realtime Database:', config.databaseURL);
      return dbInstance;
    } catch (err) {
      console.warn('[WeddingFirebase] Failed to initialize Firebase:', err);
      connectionStatus = 'fallback';
      return null;
    }
  }

  function getDatabase() {
    if (!isInitialized) {
      init();
    }
    return dbInstance;
  }

  function getStatus() {
    return connectionStatus;
  }

  return {
    init,
    getDatabase,
    getConfig,
    saveConfig,
    getStatus
  };
})();

// Auto initialize on load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    WeddingFirebase.init();
  });
}
