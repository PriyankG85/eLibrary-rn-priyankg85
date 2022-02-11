import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = initializeApp({
  apiKey: "AIzaSyDvc32r5sK0SwoiG9_asFtPswSdSE7NecI",
  authDomain: "e-library-priyankg85.firebaseapp.com",
  projectId: "e-library-priyankg85",
  storageBucket: "e-library-priyankg85.appspot.com",
  messagingSenderId: "690984879173",
  appId: "1:690984879173:web:078b8a65d7968379be4f2c",
});

export default getFirestore();
