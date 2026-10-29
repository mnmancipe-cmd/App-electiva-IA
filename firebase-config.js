/**
 * Configuración de Firebase y Firestore para Dosis-Ya!
 * Proyecto: dosis-ya-pediatria
 */

const firebaseConfig = {
  apiKey: "AIzaSyAYzBbw_jRqALjhxFjiWtkytY5Lhc8a0OQ",
  authDomain: "dosis-ya-pediatria.firebaseapp.com",
  projectId: "dosis-ya-pediatria",
  storageBucket: "dosis-ya-pediatria.firebasestorage.app",
  messagingSenderId: "206341781995",
  appId: "1:206341781995:web:c7cf850c61f7897cf241ae"
};

// Inicialización de Firebase
let db = null;
try {
  if (typeof firebase !== "undefined") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase Firestore inicializado correctamente.");
  }
} catch (error) {
  console.warn("No se pudo inicializar Firebase:", error);
}
