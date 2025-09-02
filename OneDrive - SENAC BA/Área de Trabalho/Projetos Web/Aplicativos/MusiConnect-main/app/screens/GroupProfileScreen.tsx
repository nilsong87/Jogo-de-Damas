import React from 'react';
import { View, StyleSheet, FlatList, Text, Alert } from 'react-native';
import { Appbar, Avatar, Title, Subheading, Button, Divider, Card, Paragraph, FAB } from 'react-native-paper';
import { useAuth, Post } from '../context/AuthContext';
import PostCard from '../components/PostCard'; // Import reusable component

const GroupProfileHeader = ({ group }: { group: any }) => (
    <View style={styles.headerContainer}>
        <Card.Cover source={{ uri: group.coverImage }} />
        <Title style={styles.groupName}>{group.name}</Title>
        <Paragraph style={styles.groupDescription}>{group.description}</Paragraph>
        <Subheading>{`${group.members.length} membros`}</Subheading>
        <Divider style={styles.divider} />
        <Title style={styles.postsHeader}>Publicações do Grupo</Title>
    </View>
);

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
type GroupProfileScreenNavigationProp = NativeStackNavigationProp<any>;
export default function GroupProfileScreen({ route, navigation }: { route: any, navigation: GroupProfileScreenNavigationProp }) {
  const { groupId } = route.params;
  const { groups, user, deletePost, sharePost } = useAuth(); // Get current user and post functions
  const group = groups.find(g => g.id === groupId);

  if (!group) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content title="Erro" />
        </Appbar.Header>
        <Text style={styles.errorText}>Grupo não encontrado!</Text>
      </View>
    );
  }

  const handleEditPost = (post: Post) => {
      try {
          // Navigate to the root modal screen for editing
          navigation.navigate('EditPost', { postId: post.id });
      } catch (error) {
          console.error("Erro ao editar post: ", error);
          Alert.alert("Erro", "Não foi possível editar o post.");
      }
  }

  const renderItem = ({ item }: { item: Post | {type: string} }) => {
    if ('type' in item && item.type === 'header') {
        return <GroupProfileHeader group={group} />;
    }
    return <PostCard 
        post={item as Post} 
        currentUser={user}
        onEdit={handleEditPost}
        onDelete={deletePost}
        onShare={sharePost}
    />;
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={group.name} />
      </Appbar.Header>
      <FlatList
        data={[{ type: 'header' }, ...group.posts]}
        renderItem={renderItem}
        keyExtractor={(item, index) => 'type' in item ? item.type : item.id}
        style={styles.list}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        label="Postar no Grupo"
        onPress={() => navigation.navigate('CreatePost', { groupId: group.id })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  errorText: { padding: 16, fontSize: 18 },
  headerContainer: { marginBottom: 16 },
  groupName: { fontSize: 28, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 16 },
  groupDescription: { paddingHorizontal: 16, paddingBottom: 16 },
  divider: { marginVertical: 8 },
  postsHeader: { fontSize: 20, fontWeight: 'bold', paddingHorizontal: 16, marginTop: 16 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});
