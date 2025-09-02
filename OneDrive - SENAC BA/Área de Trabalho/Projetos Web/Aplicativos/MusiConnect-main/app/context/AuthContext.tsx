/**
 * Contexto de autenticação do MusiConnect.
 *
 * Este arquivo define o AuthContext, o AuthProvider e o hook useAuth.
 * O AuthProvider gerencia o estado global de autenticação, usuários, posts e grupos.
 *
 * Importe e envolva seu App com o AuthProvider para acesso ao contexto:
 * import { AuthProvider } from './app/context/AuthContext';
 *
 * Para acessar o contexto em componentes:
 * const { user, login, logout } = useAuth();
 */
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { registerForPushNotificationsAsync } from '../services/notificationService';
import { Alert } from 'react-native';
import { signUp, signIn, logOut, getCurrentUser } from '../services/authService';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { firebaseApp } from '../services/firebaseConfig';
import { getPosts, getGroups, getFriends, updateUserProfile, addPost as addPostFirestore, addGroup as addGroupFirestore, updatePost as updatePostFirestore, deletePost as deletePostFirestore, addFriend as addFriendFirestore, removeFriend as removeFriendFirestore } from '../services/firestoreService';

// --- DATA INTERFACES ---
export interface User {
  name: string;
  email: string;
  handle: string;
  avatar: string;
  bio?: string;
  friends?: User[];
  styles?: string[];
  instruments?: string[];
  pushToken?: string;
}

export interface Post {
  id: string;
  author: User;
  timestamp: string;
  text: string;
  image?: string;
  video?: string;
  music?: { title: string; artist: string };
  groupId?: string;
  originalAuthor?: User; // If this exists, it's a shared post
}

export interface Group {
    id: string;
    name: string;
    description: string;
    coverImage: string;
    members: User[];
    posts: Post[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  posts: Post[];
  groups: Group[];
  login: (email?: string, password?: string) => Promise<void> | void;
  logout: () => Promise<void> | void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (newUserData: Partial<User>) => void;
  addPost: (postData: Pick<Post, 'text' | 'image' | 'video' | 'music'>, groupId?: string) => void;
  editPost: (postId: string, updatedData: Partial<Post>) => void;
  deletePost: (postId: string) => void;
  sharePost: (post: Post) => void;
  createGroup: (groupData: Pick<Group, 'name' | 'description' | 'coverImage'>) => void;
  addFriend: (friend: User) => void;
  removeFriend: (friendHandle: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- SEM MOCK: dados reais do Firestore ---

// --- AUTH PROVIDER COMPONENT ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const db = getFirestore(firebaseApp);

  const login = async (email?: string, password?: string) => {
    try {
      let firebaseUser;
      if (email && password) {
        firebaseUser = await signIn(email, password);
      } else {
        firebaseUser = getCurrentUser();
      }

      if (firebaseUser) {
        // Registrar token de push
        const pushToken = await registerForPushNotificationsAsync();
        setIsAuthenticated(true);
        // Buscar dados reais do usuário no Firestore
        const userId = firebaseUser.email!;
        const userRef = doc(db, 'users', userId);
        let userSnap = await getDoc(userRef);
        let userData: User;
        if (!userSnap.exists()) {
          // Se não existe, cria perfil básico
          userData = {
            name: firebaseUser.displayName || firebaseUser.email || '',
            email: firebaseUser.email!,
            handle: firebaseUser.email ? firebaseUser.email.split('@')[0] : '',
            avatar: '',
            bio: '',
            friends: [],
            styles: [],
            instruments: [],
            pushToken,
          };
          await setDoc(userRef, userData);
        } else {
          // Atualiza pushToken
          const snapData = userSnap.data();
          userData = {
            name: snapData.name || '',
            email: userId,
            handle: snapData.handle || '',
            avatar: snapData.avatar || '',
            bio: snapData.bio || '',
            friends: snapData.friends || [],
            styles: snapData.styles || [],
            instruments: snapData.instruments || [],
            pushToken,
          };
          await setDoc(userRef, { ...snapData, pushToken }, { merge: true });
        }
        setUser(userData);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert('Erro ao logar', err.message);
      } else {
        Alert.alert('Erro ao logar', 'Erro desconhecido');
      }
    }
  };

  const logout = async () => {
    try {
      await logOut();
      setIsAuthenticated(false);
      setUser(null);
      setPosts([]);
    } catch (error) {
      console.error("Erro ao fazer logout: ", error);
      Alert.alert('Erro', 'Não foi possível fazer logout.');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await signUp(email, password);
      const firebaseUser = getCurrentUser();
      if (firebaseUser) {
        // Registrar token de push
        const pushToken = await registerForPushNotificationsAsync();
        setIsAuthenticated(true);
        // Cria perfil do usuário no Firestore
        const userId = firebaseUser.email!;
        const userData: User = {
          name,
          email,
          handle: email ? email.split('@')[0] : '',
          avatar: '',
          bio: '',
          friends: [],
          styles: [],
          instruments: [],
          pushToken,
        };
        await setDoc(doc(db, 'users', userId), userData);
        setUser(userData);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert('Erro ao cadastrar', err.message);
      } else {
        Alert.alert('Erro ao cadastrar', 'Erro desconhecido');
      }
    }
  };
  const updateUser = async (newUserData: Partial<User>) => {
    try {
      if (user && user.email) {
        await updateUserProfile(user.email, newUserData);
        setUser({ ...user, ...newUserData });
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário: ", error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    }
  };

  const addFriend = async (friend: User) => {
    try {
      if (!user || !user.email) return;
      if (user.friends?.find((f: User) => f.handle === friend.handle)) {
        Alert.alert('Já é seu amigo!');
        return;
      }
      await addFriendFirestore(user.email, friend.handle!); // Adiciona a amizade no Firestore
      setUser({ ...user, friends: [...(user.friends || []), friend] });
      Alert.alert('Amizade adicionada!');
    } catch (error) {
      console.error("Erro ao adicionar amigo: ", error);
      Alert.alert('Erro', 'Não foi possível adicionar amigo.');
    }
  };

  const removeFriend = async (friendHandle: string) => {
    try {
      if (!user || !user.email) return;
      await removeFriendFirestore(user.email, friendHandle); // Remove a amizade no Firestore
      setUser({ ...user, friends: (user.friends || []).filter((f: User) => f.handle !== friendHandle) });
      Alert.alert('Amizade removida!');
    } catch (error) {
      console.error("Erro ao remover amigo: ", error);
      Alert.alert('Erro', 'Não foi possível remover amigo.');
    }
  };

  const addPost = async (postData: Pick<Post, 'text' | 'image' | 'video' | 'music'>, groupId?: string) => {
    try {
      if (!user) return;
      const newPost: Post = { id: `post${Date.now()}`, author: user, timestamp: 'agora mesmo', ...postData };
      const postRef = await addPostFirestore(newPost); // Use a função do firestoreService
      if (postRef) { // Check if postRef is not null
        newPost.id = postRef.id; // Atualiza o ID do post com o ID gerado pelo Firestore
      }

      if (groupId) {
        setGroups(groups.map((g: Group) => g.id === groupId ? { ...g, posts: [newPost, ...g.posts] } : g));
      } else {
        setPosts([newPost, ...posts]);
      }
    } catch (error) {
      console.error("Erro ao adicionar post: ", error);
      Alert.alert('Erro', 'Não foi possível adicionar post.');
    }
  };

  const editPost = (postId: string, updatedData: Partial<Post>) => {
    try {
      const editor = (p: Post) => p.id === postId ? { ...p, ...updatedData, timestamp: `${p.timestamp} (editado)` } : p;
      updatePostFirestore(postId, updatedData); // Atualiza o post no Firestore
      setPosts(posts.map(editor));
      setGroups(groups.map((g: Group) => ({ ...g, posts: g.posts.map(editor) })));
    } catch (error) {
      console.error("Erro ao editar post: ", error);
      Alert.alert('Erro', 'Não foi possível editar post.');
    }
  };

  const deletePost = (postId: string) => {
    try {
      if (!user) return;
      const postToDelete = [...posts, ...groups.flatMap((g: Group) => g.posts)].find((p: Post) => p.id === postId);
      if (postToDelete?.author.handle !== user.handle) {
        Alert.alert("Erro", "Você só pode deletar seus próprios posts.");
        return;
      }
      deletePostFirestore(postId); // Deleta o post no Firestore
      setPosts(posts.filter((p: Post) => p.id !== postId));
      setGroups(groups.map((g: Group) => ({ ...g, posts: g.posts.filter((p: Post) => p.id !== postId) })));
      Alert.alert("Sucesso", "Post deletado.");
    } catch (error) {
      console.error("Erro ao deletar post: ", error);
      Alert.alert('Erro', 'Não foi possível deletar post.');
    }
  };

  const sharePost = async (post: Post) => {
    try {
      if (!user) return;
      const newSharedPost: Post = {
        ...post, // Copy original content
        id: `shared${Date.now()}`,
        author: user, // The new author is the user who shares
        originalAuthor: post.author, // Keep track of the original author
        timestamp: 'agora mesmo',
        groupId: undefined, // Shared posts appear on the user's personal feed
      };
      const postRef = await addPostFirestore(newSharedPost); // Adiciona o post compartilhado no Firestore
      if (postRef) { // Check if postRef is not null
        newSharedPost.id = postRef.id; // Atualiza o ID do post com o ID gerado pelo Firestore
      }
      setPosts([newSharedPost, ...posts]);
      Alert.alert("Sucesso", "Post compartilhado no seu perfil!");
    } catch (error) {
      console.error("Erro ao compartilhar post: ", error);
      Alert.alert('Erro', 'Não foi possível compartilhar post.');
    }
  };

  const createGroup = async (groupData: Pick<Group, 'name' | 'description' | 'coverImage'>) => {
    try {
      if (!user) return;
      const newGroup: Group = { id: `group${Date.now()}`, ...groupData, members: [user], posts: [] };
      const groupRef = await addGroupFirestore(newGroup); // Use a função do firestoreService
      if (groupRef) { // Check if groupRef is not null
        newGroup.id = groupRef.id; // Atualiza o ID do grupo com o ID gerado pelo Firestore
      }
      setGroups([newGroup, ...groups]);
    } catch (error) {
      console.error("Erro ao criar grupo: ", error);
      Alert.alert('Erro', 'Não foi possível criar grupo.');
    }
  };

  // Métodos de fetch Firestore
  const fetchPosts = async () => {
    try {
      const postsFirestore = await getPosts();
      setPosts(postsFirestore);
    } catch (error) {
      console.error("Erro ao buscar posts: ", error);
      Alert.alert('Erro', 'Não foi possível buscar posts.');
    }
  };

  const fetchGroups = async () => {
    try {
      const groupsFirestore = await getGroups();
      setGroups(groupsFirestore);
    } catch (error) {
      console.error("Erro ao buscar grupos: ", error);
      Alert.alert('Erro', 'Não foi possível buscar grupos.');
    }
  };

  const fetchFriends = async () => {
    try {
      if (!user) return;
      const friendsFirestore = await getFriends(user.handle);
      setUser({ ...user, friends: friendsFirestore });
    } catch (error) {
      console.error("Erro ao buscar amigos: ", error);
      Alert.alert('Erro', 'Não foi possível buscar amigos.');
    }
  };

  // Buscar dados reais ao carregar ou mudar usuário
  React.useEffect(() => {
    fetchPosts();
    fetchGroups();
    if (user) fetchFriends();
  }, [user]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, posts, groups, login, logout, register, updateUser, addPost, editPost, deletePost, sharePost, createGroup, addFriend, removeFriend }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- CUSTOM HOOK ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) { throw new Error('useAuth must be used within an AuthProvider'); }
  return context;
};