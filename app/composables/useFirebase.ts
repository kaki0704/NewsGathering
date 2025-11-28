import { type FirebaseApp, getApps, initializeApp } from 'firebase/app'
import {
  type Auth,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from 'firebase/auth'
import {
  collection,
  type DocumentData,
  deleteDoc,
  doc,
  type Firestore,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  onSnapshot,
  orderBy,
  type QuerySnapshot,
  query,
  setDoc,
  type Unsubscribe,
  updateDoc,
} from 'firebase/firestore'

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null

export const useFirebase = () => {
  const config = useRuntimeConfig()

  const initializeFirebase = (): { db: Firestore; auth: Auth } => {
    if (!app && getApps().length === 0) {
      const firebaseConfig = {
        apiKey: config.public.firebaseApiKey,
        authDomain: config.public.firebaseAuthDomain,
        databaseURL: config.public.firebaseDatabaseUrl,
        projectId: config.public.firebaseProjectId,
        storageBucket: config.public.firebaseStorageBucket,
        messagingSenderId: config.public.firebaseMessagingSenderId,
        appId: config.public.firebaseAppId,
        measurementId: config.public.firebaseMeasurementId,
      }
      app = initializeApp(firebaseConfig)
    }
    if (!db) {
      db = getFirestore(app!)
    }
    if (!auth) {
      auth = getAuth(app!)
    }
    return { db, auth }
  }

  const getDb = (): Firestore => {
    if (!db) {
      initializeFirebase()
    }
    return db!
  }

  const getAuthInstance = (): Auth => {
    if (!auth) {
      initializeFirebase()
    }
    return auth!
  }

  const loginWithEmail = async (
    email: string,
    password: string,
  ): Promise<UserCredential> => {
    const authInstance = getAuthInstance()
    return signInWithEmailAndPassword(authInstance, email, password)
  }

  const registerWithEmail = async (
    email: string,
    password: string,
  ): Promise<UserCredential> => {
    const authInstance = getAuthInstance()
    return createUserWithEmailAndPassword(authInstance, email, password)
  }

  const logout = async (): Promise<void> => {
    const authInstance = getAuthInstance()
    return signOut(authInstance)
  }

  return {
    initializeFirebase,
    getDb,
    getAuthInstance,
    loginWithEmail,
    registerWithEmail,
    logout,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    updateDoc,
    increment,
  }
}

export type { DocumentData, QuerySnapshot, Unsubscribe, UserCredential }
