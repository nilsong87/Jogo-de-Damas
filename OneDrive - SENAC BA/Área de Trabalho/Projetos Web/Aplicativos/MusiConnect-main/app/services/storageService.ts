/**
 * Serviço de armazenamento do MusiConnect.
 *
 * Este arquivo contém funções para upload e manipulação de arquivos (imagens, vídeos, músicas).
 * Todas usam a instância única do Firebase App.
 *
 * Importe as funções deste serviço para upload de arquivos.
 */
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from './firebaseConfig';

const storage = getStorage(firebaseApp);

// Upload de mídia (imagem, vídeo, áudio)
export const uploadMedia = async (uri: string, folder: string = 'media'): Promise<string> => {
  // Para React Native, é necessário buscar o blob
  const response = await fetch(uri);
  const blob = await response.blob();
  const filename = uri.split('/').pop() || `file_${Date.now()}`;
  const storageRef = ref(storage, `${folder}/${filename}`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
};
