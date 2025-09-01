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
import { getPosts, getGroups, getFriends, updateUserProfile } from '../services/firestoreService';

// --- DATA INTERFACES ---
export interface User {
  name: string;
  email: string;
  handle: string;
  avatar: string;
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

  const login = async (email?: string, password?: string) => {
    try {
      if (email && password) {
        await signIn(email, password);
      }
      const firebaseUser = getCurrentUser();
      if (firebaseUser) {
        // Registrar token de push
        const pushToken = await registerForPushNotificationsAsync();
        setIsAuthenticated(true);
        // Buscar dados reais do usuário no Firestore
        const { getFirestore, doc, getDoc, setDoc } = await import('firebase/firestore');
  const { firebaseApp } = await import('../services/firebaseConfig');
  const db = getFirestore(firebaseApp);
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
    await logOut();
    setIsAuthenticated(false);
    setUser(null);
    setPosts([]);
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
        const { getFirestore, doc, setDoc } = await import('firebase/firestore');
  const { firebaseApp } = await import('../services/firebaseConfig');
  const db = getFirestore(firebaseApp);
        const userId = firebaseUser.email!;
        const userData: User = {
          name,
          email,
          handle: email ? email.split('@')[0] : '',
          avatar: '',
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
    if (user && user.email) {
      const { getFirestore, doc, setDoc } = await import('firebase/firestore');
  const { firebaseApp } = await import('../services/firebaseConfig');
  const db = getFirestore(firebaseApp);
      await setDoc(doc(db, 'users', user.email), newUserData, { merge: true });
      setUser({ ...user, ...newUserData });
    }
  };

  const addFriend = (friend: User) => {
    if (!user) return;
  if (user.friends?.find((f: User) => f.handle === friend.handle)) {
      Alert.alert('Já é seu amigo!');
      return;
    }
    setUser({ ...user, friends: [...(user.friends || []), friend] });
    Alert.alert('Amizade adicionada!');
  };

  const removeFriend = (friendHandle: string) => {
    if (!user) return;
  setUser({ ...user, friends: (user.friends || []).filter((f: User) => f.handle !== friendHandle) });
    Alert.alert('Amizade removida!');
  };

  const addPost = (postData: Pick<Post, 'text' | 'image' | 'video' | 'music'>, groupId?: string) => {
    if (!user) return;
    const newPost: Post = { id: `post${Date.now()}`, author: user, timestamp: 'agora mesmo', ...postData };
    if (groupId) {
  setGroups(groups.map((g: Group) => g.id === groupId ? { ...g, posts: [newPost, ...g.posts] } : g));
    } else {
        setPosts([newPost, ...posts]);
    }
  };

  const editPost = (postId: string, updatedData: Partial<Post>) => {
    const editor = (p: Post) => p.id === postId ? { ...p, ...updatedData, timestamp: `${p.timestamp} (editado)` } : p;
    setPosts(posts.map(editor));
  setGroups(groups.map((g: Group) => ({ ...g, posts: g.posts.map(editor) })));
  };

  const deletePost = (postId: string) => {
      if (!user) return;
  const postToDelete = [...posts, ...groups.flatMap((g: Group) => g.posts)].find((p: Post) => p.id === postId);
      if (postToDelete?.author.handle !== user.handle) {
          Alert.alert("Erro", "Você só pode deletar seus próprios posts.");
          return;
      }
  setPosts(posts.filter((p: Post) => p.id !== postId));
  setGroups(groups.map((g: Group) => ({ ...g, posts: g.posts.filter((p: Post) => p.id !== postId) })));
      Alert.alert("Sucesso", "Post deletado.");
  }

  const sharePost = (post: Post) => {
      if (!user) return;
      const newSharedPost: Post = {
          ...post, // Copy original content
          id: `shared${Date.now()}`,
          author: user, // The new author is the user who shares
          originalAuthor: post.author, // Keep track of the original author
          timestamp: 'agora mesmo',
          groupId: undefined, // Shared posts appear on the user's personal feed
      };
      setPosts([newSharedPost, ...posts]);
      Alert.alert("Sucesso", "Post compartilhado no seu perfil!");
  }

  const createGroup = (groupData: Pick<Group, 'name' | 'description' | 'coverImage'>) => {
      if (!user) return;
      const newGroup: Group = { id: `group${Date.now()}`, ...groupData, members: [user], posts: [] };
      setGroups([newGroup, ...groups]);
  }

  // Métodos de fetch Firestore
  const fetchPosts = async () => {
    const postsFirestore = await getPosts();
    setPosts(postsFirestore);
  };

  const fetchGroups = async () => {
    const groupsFirestore = await getGroups();
    setGroups(groupsFirestore);
  };

  const fetchFriends = async () => {
    if (!user) return;
    const friendsFirestore = await getFriends(user.handle);
    setUser({ ...user, friends: friendsFirestore });
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
