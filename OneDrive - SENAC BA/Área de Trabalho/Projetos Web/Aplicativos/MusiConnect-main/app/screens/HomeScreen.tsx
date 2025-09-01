/**
 * Tela inicial do MusiConnect.
 *
 * Exibe feed de posts, sugestões e atalhos principais.
 * Use esta tela como ponto de entrada do usuário autenticado.
 */


import React from 'react';
import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Appbar, FAB } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
type HomeScreenNavigationProp = NativeStackNavigationProp<any>;
export default function HomeScreen({ navigation }: { navigation: HomeScreenNavigationProp }) {
  const { posts, user, deletePost, sharePost } = useAuth();

  const handleEditPost = (post: any) => {
    navigation.navigate('EditPost', { postId: post.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Feed MusiConnect" />
      </Appbar.Header>
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
