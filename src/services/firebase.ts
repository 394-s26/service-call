import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const isFirebaseConfigured = Boolean(
  envConfig.apiKey &&
    envConfig.authDomain &&
    envConfig.projectId &&
    envConfig.appId
);

const firebaseConfig = isFirebaseConfigured
  ? envConfig
  : {
      apiKey: "local-dev-placeholder",
      authDomain: "local-dev-placeholder.firebaseapp.com",
      projectId: "local-dev-placeholder",
      storageBucket: "local-dev-placeholder.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:localdevplaceholder",
    };

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
