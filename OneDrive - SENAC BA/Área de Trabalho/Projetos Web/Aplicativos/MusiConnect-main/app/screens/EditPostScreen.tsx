import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { Appbar, TextInput, Button, Card, Avatar, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
type EditPostScreenNavigationProp = NativeStackNavigationProp<any>;
export default function EditPostScreen({ navigation, route }: { navigation: EditPostScreenNavigationProp, route: any }) {
  const { postId } = route.params;
  const { posts, editPost } = useAuth();
  
  const postToEdit = posts.find(p => p.id === postId);

  const [text, setText] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [music, setMusic] = useState<{ title: string; artist: string } | undefined>();

  useEffect(() => {
    if (postToEdit) {
      setText(postToEdit.text || '');
      setImage(postToEdit.image);
      setMusic(postToEdit.music);
    }
  }, [postToEdit]);

  const handleSave = async () => {
    if (!text.trim() && !image && !music) {
      Alert.alert('Erro', 'Você não pode deixar uma postagem vazia.');
      return;
    }
    try {
      await editPost(postId, { text, image, music });
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao salvar post: ", error);
      Alert.alert('Erro', 'Não foi possível salvar o post.');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Desculpe, precisamos da permissão para acessar a galeria!');
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao escolher imagem: ", error);
      Alert.alert('Erro', 'Não foi possível escolher a imagem.');
    }
  };
  
  const pickMusic = () => {
      setMusic({ title: 'Kalimba', artist: 'Mr. Scruff' });
  }

  if (!postToEdit) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Post não encontrado!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Editar Publicação" />
        <Button onPress={handleSave}>Salvar</Button>
      </Appbar.Header>
      <View style={styles.content}>
        <TextInput
          placeholder="O que está acontecendo?"
          multiline
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        {image && <Card.Cover source={{ uri: image }} style={styles.imagePreview} />}
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
          <Appbar.Action icon="music" onPress={pickMusic} />
          <Appbar.Action icon="video" onPress={() => Alert.alert('Em breve!', 'A seleção de vídeos será implementada em breve.')} />
      </Appbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  input: { 
      flex: 1,
      backgroundColor: 'transparent',
      fontSize: 18
  },
  bottomBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
  },
  imagePreview: {
      marginVertical: 16,
      height: 200,
  }
});