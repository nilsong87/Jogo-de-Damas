/**
 * Tela de criação de grupo.
 *
 * Permite ao usuário criar um novo grupo musical, definir nome, descrição e imagem.
 * Use esta tela para iniciar novas comunidades.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, TextInput, Button, Avatar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
type CreateGroupScreenNavigationProp = NativeStackNavigationProp<any>;
export default function CreateGroupScreen({ navigation }: { navigation: CreateGroupScreenNavigationProp }) {
  const { createGroup } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('https://i.pravatar.cc/400?u=group-default');

  const handleCreate = () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Erro', 'Nome e descrição do grupo são obrigatórios.');
      return;
    }
    createGroup({ name, description, coverImage });
    Alert.alert('Sucesso', 'Grupo criado!');
    navigation.goBack();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Desculpe, precisamos da permissão para acessar a galeria!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Criar Novo Grupo" />
        <Button onPress={handleCreate}>Criar</Button>
      </Appbar.Header>
      <View style={styles.content}>
        <Avatar.Image size={150} source={{ uri: coverImage }} style={styles.avatar} />
        <Button onPress={pickImage}>Escolher Imagem de Capa</Button>
        <TextInput
          label="Nome do Grupo"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, alignItems: 'center' },
  input: { width: '100%', marginTop: 16 },
  avatar: { marginBottom: 16 },
});
