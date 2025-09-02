import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Appbar, TextInput, Button, Card, Avatar, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { Video, ResizeMode } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { model } from '../services/geminiService'; // Importe o modelo

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
type CreatePostScreenNavigationProp = NativeStackNavigationProp<any>;
export default function CreatePostScreen({ navigation, route }: { navigation: CreatePostScreenNavigationProp, route: any }) {
  const { groupId } = route.params || {};
  const { addPost } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [music, setMusic] = useState<any | undefined>();
  const [video, setVideo] = useState<string | undefined>();
  const [prompt, setPrompt] = useState('');

  const handlePost = async () => {
    if (!text.trim() && !image && !music && !video) {
      Alert.alert('Erro', 'Você não pode criar uma postagem vazia.');
      return;
    }
    try {
      await addPost({ text, image, music, video }, groupId);
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao criar post: ", error);
      Alert.alert('Erro', 'Não foi possível criar o post.');
    }
  };

  const generatePost = async () => {
    if (!prompt.trim()) {
      Alert.alert('Erro', 'Por favor, digite uma ideia para o post.');
      return;
    }
    try {
      const result = await model.generateContent(`Crie um post para uma rede social de músicos com a seguinte ideia: ${prompt}`);
      const response = result.response;
      const generatedText = response.text();
      setText(generatedText);
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível gerar o post.");
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
        quality: 1,
      });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao escolher imagem: ", error);
      Alert.alert('Erro', 'Não foi possível escolher a imagem.');
    }
  };

  const pickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Desculpe, precisamos da permissão para acessar a galeria!');
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled) {
        setVideo(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao escolher vídeo: ", error);
      Alert.alert('Erro', 'Não foi possível escolher o vídeo.');
    }
  };

  const pickMusic = () => {
    setMusic({ title: 'Kalimba', artist: 'Mr. Scruff' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Action icon="close" onPress={() => navigation.goBack()} />
        <Appbar.Content title={groupId ? "Postar no Grupo" : "Nova Publicação"} />
        <Button onPress={handlePost}>Postar</Button>
      </Appbar.Header>
      <View style={styles.content}>
        <TextInput
          placeholder="Digite sua ideia para o post..."
          value={prompt}
          onChangeText={setPrompt}
          style={styles.promptInput}
        />
        <Button onPress={generatePost}>Gerar com IA</Button>
        <TextInput
          placeholder="Seu post gerado aparecerá aqui..."
          multiline
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        {image && <Card.Cover source={{ uri: image }} style={styles.imagePreview} />}
        {video && (
          <View style={styles.videoPreview}>
            <Video
              source={{ uri: video }}
              style={{ width: '100%', height: 220 }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
            />
            <IconButton icon="close" onPress={() => setVideo(undefined)} style={styles.closeVideoBtn} />
          </View>
        )}
        {music && (
          <Card.Title
            title={music.title}
            subtitle={music.artist}
            left={(props) => <Avatar.Icon {...props} icon="music" />}
            right={(props) => <IconButton {...props} icon="close" onPress={() => setMusic(undefined)} />}
          />
        )}
      </View>
      <Appbar style={styles.bottomBar}>
        <Appbar.Action icon="image" onPress={pickImage} />
        <Appbar.Action icon="video" onPress={pickVideo} />
        <Appbar.Action icon="music" onPress={pickMusic} />
      </Appbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 16 },
  promptInput: {
    backgroundColor: 'transparent',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 18,
    marginBottom: 8,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  imagePreview: {
    marginVertical: 16,
    height: 200,
    borderRadius: 8,
  },
  videoPreview: {
    marginVertical: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  closeVideoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    zIndex: 20,
  },
});