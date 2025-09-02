import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, TextInput, Button, Avatar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { model } from '../services/geminiService'; // Importe o modelo

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
type CreateGroupScreenNavigationProp = NativeStackNavigationProp<any>;
export default function CreateGroupScreen({ navigation }: { navigation: CreateGroupScreenNavigationProp }) {
  const { createGroup } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('https://i.pravatar.cc/400?u=group-default');
  const [prompt, setPrompt] = useState('');

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Erro', 'Nome e descrição do grupo são obrigatórios.');
      return;
    }
    try {
      await createGroup({ name, description, coverImage });
      Alert.alert('Sucesso', 'Grupo criado!');
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao criar grupo: ", error);
      Alert.alert('Erro', 'Não foi possível criar o grupo.');
    }
  };

  const generateDescription = async () => {
    if (!prompt.trim()) {
      Alert.alert('Erro', 'Por favor, digite uma ideia para a descrição do grupo.');
      return;
    }
    try {
      const result = await model.generateContent(`Crie uma descrição curta e empolgante para um grupo de músicos com as seguintes características: ${prompt}`);
      const response = result.response;
      const generatedText = response.text();
      setDescription(generatedText);
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível gerar a descrição.");
    }
  };

  const pickImage = async () => {
    try {
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
    } catch (error) {
      console.error("Erro ao escolher imagem: ", error);
      Alert.alert('Erro', 'Não foi possível escolher a imagem.');
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
          label="Ideias para a descrição (estilos, objetivos, etc.)"
          value={prompt}
          onChangeText={setPrompt}
          style={styles.input}
        />
        <Button onPress={generateDescription}>Gerar Descrição com IA</Button>
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
