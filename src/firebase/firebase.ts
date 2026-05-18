import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyA1sSqjL2usudRicVAtOlamN_cynnaId44",
    authDomain: "snippet-app-62ad2.firebaseapp.com",
    projectId: "snippet-app-62ad2",
    storageBucket: "snippet-app-62ad2.firebasestorage.app",
    messagingSenderId: "722020757468",
    appId: "1:722020757468:web:11cced14813b0dc185a919",
    measurementId: "G-BH7KM9VWCB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);