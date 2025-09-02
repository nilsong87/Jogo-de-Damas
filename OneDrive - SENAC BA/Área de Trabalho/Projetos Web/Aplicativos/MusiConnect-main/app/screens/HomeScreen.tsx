import React from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, Button, Alert } from 'react-native';
import { Appbar, FAB } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { model } from '../services/geminiService'; // Importe o modelo

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
type HomeScreenNavigationProp = NativeStackNavigationProp<any>;
export default function HomeScreen({ navigation }: { navigation: HomeScreenNavigationProp }) {
  const { posts, user, deletePost, sharePost } = useAuth();

  const handleEditPost = (post: any) => {
    try {
      navigation.navigate('EditPost', { postId: post.id });
    } catch (error) {
      console.error("Erro ao editar post: ", error);
      Alert.alert("Erro", "Não foi possível editar o post.");
    }
  };

  const generateJoke = async () => {
    try {
      const result = await model.generateContent("Conte uma piada de programador.");
      const response = result.response;
      const text = response.text();
      Alert.alert("Piada do Gemini:", text);
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível gerar a piada.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Feed MusiConnect" />
      </Appbar.Header>
      <Button title="Gerar Piada" onPress={generateJoke} />
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUser={user}
            onEdit={handleEditPost}
            onDelete={deletePost}
            onShare={sharePost}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreatePost')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
