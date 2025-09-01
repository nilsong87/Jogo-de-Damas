/**
 * Serviço de acesso ao Firestore do MusiConnect.
 *
 * Este arquivo contém funções para CRUD de posts, grupos, amigos e perfis.
 * Todas usam a instância única do Firebase App.
 *
 * Importe as funções deste serviço para manipular dados no Firestore.
 */
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';
import { firebaseApp } from './firebaseConfig';
import { sendPushNotification } from './pushSenderService';
import { Post, Group, User } from '../context/AuthContext';

const db = getFirestore(firebaseApp);

// Adicionar post
export const addPost = async (postData: Omit<Post, 'id'>) => {
  // Adiciona post
  const postRef = await addDoc(collection(db, 'posts'), postData);

  // Notificar amigos do autor
  if (postData.author && postData.author.handle) {
    const userSnap = await getDoc(doc(db, 'users', postData.author.handle));
    const userData = userSnap.data();
    if (userData && userData.friends && Array.isArray(userData.friends)) {
      for (const friendHandle of userData.friends) {
        const friendSnap = await getDoc(doc(db, 'users', friendHandle));
        const friendData = friendSnap.data();
        if (friendData && friendData.pushToken) {
          await sendPushNotification(
            friendData.pushToken,
            'Novo post de um amigo!',
            `${postData.author.name} publicou: ${postData.text || 'Novo conteúdo'}`,
            { postId: postRef.id }
          );
        }
      }
    }
  }
  return postRef;
};

// Buscar posts
export const getPosts = async (): Promise<Post[]> => {
  const snapshot = await getDocs(collection(db, 'posts'));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      author: data.author,
      timestamp: data.timestamp,
      text: data.text || '',
      image: data.image,
      video: data.video,
      music: data.music,
      groupId: data.groupId,
      originalAuthor: data.originalAuthor,
    };
  });
};

// Adicionar grupo
export const addGroup = async (groupData: Omit<Group, 'id' | 'posts'>) => {
  return addDoc(collection(db, 'groups'), { ...groupData, posts: [] });
};

// Buscar grupos
export const getGroups = async (): Promise<Group[]> => {
  const snapshot = await getDocs(collection(db, 'groups'));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      coverImage: data.coverImage,
      members: data.members || [],
      posts: data.posts || [],
    };
  });
};

// Adicionar amizade (adiciona friendId ao array de amigos do userId)
export const addFriend = async (userId: string, friendId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { friends: arrayUnion(friendId) });

  // Notificar novo amigo
  const friendSnap = await getDoc(doc(db, 'users', friendId));
  const friendData = friendSnap.data();
  if (friendData && friendData.pushToken) {
    await sendPushNotification(
      friendData.pushToken,
      'Você foi adicionado como amigo!',
      `Um usuário te adicionou como amigo no MusiConnect!`,
      { userId }
    );
  }
};

// Buscar amigos
export const getFriends = async (userId: string): Promise<User[]> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.data()?.friends || [];
};

// Atualizar perfil do usuário
export const updateUserProfile = async (userId: string, data: Partial<User>) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
};
