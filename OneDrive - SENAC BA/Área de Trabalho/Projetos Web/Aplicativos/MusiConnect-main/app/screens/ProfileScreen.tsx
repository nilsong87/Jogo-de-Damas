import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList } from 'react-native';
import { Appbar, Avatar, Title, Subheading, Button, Divider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth, Post } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/ProfileStackNavigator';
import PostCard from '../components/PostCard';


type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

// Header Component for FlatList
const ProfileHeader = ({ user, posts, onPickImage, image, isOwnProfile, onAddFriend }: any) => (
  <View style={styles.headerContainer}>
    <View style={styles.avatarContainer}>
      <Avatar.Image size={120} source={{ uri: image }} />
      {isOwnProfile ? (
        <Button mode="text" onPress={onPickImage} style={styles.changePicButton}>
          Mudar foto
        </Button>
      ) : (
        <Button mode="contained" onPress={onAddFriend} style={styles.addFriendButton}>
          Adicionar Amigo
        </Button>
      )}
    </View>
    <Title style={styles.userName}>{user?.name || 'Usuário'}</Title>
    <Subheading style={styles.userHandle}>{user?.handle || '@usuario'}</Subheading>
    <Divider style={styles.divider} />
    <View style={styles.statsContainer}>
      <View style={styles.stat}>
        <Title>{user?.friends?.length || 0}</Title>
        <Subheading>Amigos</Subheading>
      </View>
      <View style={styles.stat}>
        <Title>{posts.length}</Title>
        <Subheading>Publicações</Subheading>
      </View>
    </View>
    {isOwnProfile && user?.friends && user.friends.length > 0 && (
      <View style={styles.friendsList}>
        <Subheading style={{ marginBottom: 8 }}>Sua Rede de Amigos:</Subheading>
        {user.friends.map((friend: import('../context/AuthContext').User, idx: number) => (
          <View key={friend.handle} style={styles.friendItem}>
            <Avatar.Image size={40} source={{ uri: friend.avatar }} />
            <Title style={{ fontSize: 16, marginLeft: 8 }}>{friend.name}</Title>
          </View>
        ))}
      </View>
    )}
    <Divider style={styles.divider} />
    <Title style={styles.postsHeader}>Minhas Publicações</Title>
  </View>
);

export default function ProfileScreen({ navigation }: { navigation: ProfileScreenNavigationProp }) {
  const { logout, user, posts, deletePost, sharePost, addFriend, updateUser } = useAuth();
  const [image, setImage] = useState(user?.avatar || 'https://i.pravatar.cc/150?u=profile');
  const isOwnProfile = true; // Adapte para outros perfis se necessário

  useEffect(() => {
    if (user?.avatar) setImage(user.avatar);
  }, [user]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Desculpe, precisamos da permissão da câmera para fazer isso funcionar!');
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1 });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
        // Atualiza avatar no Firestore
        await updateUser({ avatar: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Erro ao escolher imagem: ", error);
      Alert.alert('Erro', 'Não foi possível escolher a imagem.');
    }
  };

  const handleEditPost = (post: Post) => {
    try {
      (navigation as any).navigate('EditPost', { postId: post.id });
    } catch (error) {
      console.error("Erro ao editar post: ", error);
      Alert.alert("Erro", "Não foi possível editar o post.");
    }
  };

  const handleAddFriend = () => {
    Alert.alert('Função de adicionar amigo', 'Selecione um usuário para adicionar à sua rede.');
    // Implemente a busca/seleção de usuário real para adicionar
  };

  const renderItem = ({ item }: { item: Post | { type: string } }) => {
    if ('type' in item && item.type === 'header') {
      return (
        <ProfileHeader
          user={user}
          posts={posts}
          onPickImage={pickImage}
          image={image}
          isOwnProfile={isOwnProfile}
          onAddFriend={handleAddFriend}
        />
      );
    }
    return (
      <PostCard
        post={item as Post}
        currentUser={user}
        onEdit={handleEditPost}
        onDelete={deletePost}
        onShare={sharePost}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Perfil" />
        <Appbar.Action icon="account-edit" onPress={() => navigation.navigate('EditProfile')} />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>
      <FlatList
        data={[{ type: 'header' }, ...posts]}
        renderItem={renderItem}
        keyExtractor={(item, index) => ('type' in item ? item.type : item.id)}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  headerContainer: { alignItems: 'center', paddingVertical: 16 },
  avatarContainer: { alignItems: 'center', marginBottom: 16 },
  changePicButton: { marginTop: 8 },
  addFriendButton: { marginTop: 8 },
  userName: { fontSize: 24, fontWeight: 'bold' },
  userHandle: { color: 'gray', marginBottom: 16 },
  divider: { width: '100%', marginVertical: 16 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  stat: { alignItems: 'center' },
  postsHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 16, paddingHorizontal: 16 },
  friendsList: { marginTop: 16, alignItems: 'flex-start', width: '100%', paddingHorizontal: 32 },
  friendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
});