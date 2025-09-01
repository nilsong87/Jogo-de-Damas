/**
 * Serviço de autenticação do MusiConnect.
 *
 * Este arquivo contém funções para login, cadastro, logout e obtenção do usuário atual.
 * Todas usam a instância única do Firebase App.
 *
 * Importe as funções deste serviço para autenticação de usuários.
 */
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { firebaseApp } from './firebaseConfig';

const auth = getAuth(firebaseApp);

export const signUp = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = async () => {
  return signOut(auth);
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};
