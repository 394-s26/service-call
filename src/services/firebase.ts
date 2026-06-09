import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

declare global {
  // eslint-disable-next-line no-var
  var EMULATION: boolean | undefined;
}

const useEmulators = import.meta.env.VITE_USE_EMULATORS === "true";

const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
};

const hasEnvFirebaseConfig = Boolean(
  envConfig.apiKey &&
    envConfig.authDomain &&
    envConfig.projectId &&
    envConfig.appId
);

export const isFirebaseConfigured = useEmulators || hasEnvFirebaseConfig;

const emulatorFirebaseConfig = {
  apiKey: "fake-api-key",
  authDomain: "demo-servicecall.firebaseapp.com",
  projectId: "demo-servicecall",
  storageBucket: "demo-servicecall.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:emulator",
  measurementId: undefined,
};

const localPlaceholderConfig = {
  apiKey: "local-dev-placeholder",
  authDomain: "local-dev-placeholder.firebaseapp.com",
  projectId: "local-dev-placeholder",
  storageBucket: "local-dev-placeholder.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:localdevplaceholder",
  measurementId: undefined,
};

const firebaseConfig = useEmulators
  ? emulatorFirebaseConfig
  : hasEnvFirebaseConfig
    ? envConfig
    : localPlaceholderConfig;

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

if (typeof window !== "undefined" && useEmulators && !globalThis.EMULATION) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);

  void signInWithCredential(
    auth,
    GoogleAuthProvider.credential(
      '{"sub": "test-user-1", "email": "tester@gmail.com", "displayName": "Test User", "email_verified": true}'
    )
  ).then(() =>
    import("../utilities/emulatorSeed").then((mod) => mod.seedEmulatorProviders())
  );

  globalThis.EMULATION = true;
}

if (typeof window !== "undefined" && hasEnvFirebaseConfig && !useEmulators && envConfig.measurementId) {
  isSupported()
    .then((ok) => {
      if (ok) {
        getAnalytics(app);
      }
    })
    .catch(() => {});
}
