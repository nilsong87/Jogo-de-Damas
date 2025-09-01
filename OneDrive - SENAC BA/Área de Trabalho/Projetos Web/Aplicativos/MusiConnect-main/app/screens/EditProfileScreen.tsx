/**
 * Tela de edição de perfil.
 *
 * Permite ao usuário editar suas informações pessoais, foto e preferências.
 * Use esta tela para atualizar dados do perfil.
 */
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, TextInput, Button, Avatar } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/ProfileStackNavigator';
import * as ImagePicker from 'expo-image-picker';
import { uploadMedia } from '../services/storageService';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: { navigation: EditProfileScreenNavigationProp }) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [handle, setHandle] = useState(user?.handle || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [uploading, setUploading] = useState(false);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para escolher uma foto.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setUploading(true);
      try {
        const url = await uploadMedia(result.assets[0].uri, 'avatars');
        setAvatar(url);
        Alert.alert('Sucesso', 'Avatar atualizado!');
      } catch (e) {
        Alert.alert('Erro', 'Falha ao enviar imagem.');
      }
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !handle.trim()) {
      Alert.alert('Erro', 'Nome e @usuário não podem estar em branco.');
      return;
    }
    await updateUser({ name, handle, avatar });
    Alert.alert('Sucesso', 'Perfil atualizado.');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Editar Perfil" />
        <Button onPress={handleSave} loading={uploading}>Salvar</Button>
      </Appbar.Header>
      <View style={styles.content}>
        <Avatar.Image size={100} source={{ uri: avatar || 'https://i.pravatar.cc/150?u=profile' }} style={{ alignSelf: 'center', marginBottom: 16 }} />
        <Button mode="outlined" onPress={pickAvatar} disabled={uploading} style={{ marginBottom: 16 }}>
          Trocar foto de perfil
        </Button>
        <TextInput
          label="Nome"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          label="@Usuário"
          value={handle}
          onChangeText={setHandle}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
});
