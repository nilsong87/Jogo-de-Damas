import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from './firebaseConfig';

const storage = getStorage(firebaseApp);

// Upload de mídia (imagem, vídeo, áudio)
export const uploadMedia = async (uri: string, folder: string = 'media'): Promise<string> => {
  try {
    // Para React Native, é necessário buscar o blob
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `${Date.now()}_${uri.split('/').pop() || 'file'}`;
    const storageRef = ref(storage, `${folder}/${filename}`);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  } catch (error) {
    console.error("Erro ao fazer upload de mídia: ", error);
    throw error; // Re-throw the error so the calling function can handle it
  }
};