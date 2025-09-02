import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, arrayUnion, arrayRemove, getDoc, deleteDoc } from 'firebase/firestore';
import { firebaseApp } from './firebaseConfig';
import { sendPushNotification } from './pushSenderService';
import { Post, Group, User } from '../context/AuthContext';

const db = getFirestore(firebaseApp);

// Adicionar post
export const addPost = async (postData: Omit<Post, 'id'>) => {
  try {
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
  } catch (error) {
    console.error("Erro ao adicionar post: ", error);
    return null;
  }
};

// Buscar posts
export const getPosts = async (): Promise<Post[]> => {
  try {
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
  } catch (error) {
    console.error("Erro ao buscar posts: ", error);
    return [];
  }
};

// Atualizar post
export const updatePost = async (postId: string, data: Partial<Post>) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, data);
  } catch (error) {
    console.error("Erro ao atualizar post: ", error);
  }
};

// Deletar post
export const deletePost = async (postId: string) => {
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error) {
    console.error("Erro ao deletar post: ", error);
  }
};

// Adicionar grupo
export const addGroup = async (groupData: Omit<Group, 'id' | 'posts'>) => {
  try {
    return addDoc(collection(db, 'groups'), { ...groupData, posts: [] });
  } catch (error) {
    console.error("Erro ao adicionar grupo: ", error);
    return null;
  }
};

// Buscar grupos
export const getGroups = async (): Promise<Group[]> => {
  try {
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
  } catch (error) {
    console.error("Erro ao buscar grupos: ", error);
    return [];
  }
};

// Adicionar amizade (adiciona friendId ao array de amigos do userId)
export const addFriend = async (userId: string, friendId: string) => {
  try {
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
  } catch (error) {
    console.error("Erro ao adicionar amigo: ", error);
  }
};

// Remover amizade
export const removeFriend = async (userId: string, friendId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { friends: arrayRemove(friendId) });
  } catch (error) {
    console.error("Erro ao remover amigo: ", error);
  }
};

// Buscar amigos
export const getFriends = async (userId: string): Promise<User[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.data()?.friends || [];
  } catch (error) {
    console.error("Erro ao buscar amigos: ", error);
    return [];
  }
};

// Atualizar perfil do usuário
export const updateUserProfile = async (userId: string, data: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
  } catch (error) {
    console.error("Erro ao atualizar perfil do usuário: ", error);
  }
};
