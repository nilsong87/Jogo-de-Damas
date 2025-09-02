/**
 * Configuração e inicialização do Firebase para o MusiConnect.
 *
 * Este arquivo exporta a instância única do Firebase App (firebaseApp),
 * que deve ser utilizada em todos os serviços do projeto para garantir
 * que o Firebase seja inicializado apenas uma vez.
 *
 * Exemplo de uso em outros arquivos:
 * import { firebaseApp } from './firebaseConfig';
 *
 * Não inicialize o Firebase em outros arquivos!
 */
// Importe as funções necessárias do Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Para autenticação

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0d5qI3pm5nearmC2Hz5wZVeyQMGDM6F8",
  authDomain: "musiconnect-app.firebaseapp.com",
  projectId: "musiconnect-app",
  storageBucket: "musiconnect-app.appspot.com",
  messagingSenderId: "874976570784",
  appId: "1:874976570784:web:2d657efae0d47be9adc8c5"
};

// Inicialize o Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp); // Exporta a instância de autenticação