import { type FirebaseApp, getApps, initializeApp } from 'firebase/app'
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

export const useFirebase = () => {
  const config = useRuntimeConfig()

  const initializeFirebase = (): Firestore => {
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
    return db
  }

  const getDb = (): Firestore => {
    if (!db) {
      return initializeFirebase()
    }
    return db
  }

  return {
    initializeFirebase,
    getDb,
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

export type { DocumentData, QuerySnapshot, Unsubscribe }
