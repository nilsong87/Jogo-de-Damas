/**
 * Serviço de comentários do MusiConnect.
 *
 * Este arquivo contém funções para adicionar e buscar comentários de posts.
 * Todas usam a instância única do Firebase App.
 *
 * Importe as funções deste serviço para manipular comentários.
 */
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { firebaseApp } from './firebaseConfig';
import { sendPushNotification } from './pushSenderService';
import { User } from '../context/AuthContext';

const db = getFirestore(firebaseApp);

// Adicionar comentário a um post
export interface Comment {
  id?: string;
  postId?: string;
  author: User;
  text: string;
  timestamp: string;
}

export const addComment = async (postId: string, commentData: Comment) => {
  // Adiciona comentário
  const commentRef = await addDoc(collection(db, 'comments'), { ...commentData, postId });

  // Buscar post para notificar autor
  const postSnap = await getDoc(doc(db, 'posts', postId));
  const postData = postSnap.data();
  if (postData && postData.author && postData.author.pushToken && postData.author.handle !== commentData.author.handle) {
    await sendPushNotification(
      postData.author.pushToken,
      'Novo comentário no seu post!',
      `${commentData.author.name} comentou: ${commentData.text}`,
      { postId }
    );
  }
  return commentRef;
};

// Buscar comentários de um post
export const getComments = async (postId: string): Promise<Comment[]> => {
  const q = query(collection(db, 'comments'), where('postId', '==', postId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      postId: data.postId,
      author: data.author,
      text: data.text,
      timestamp: data.timestamp,
    };
  });
};
