/**
 * Tela de listagem de grupos.
 *
 * Exibe todos os grupos disponíveis para o usuário.
 * Use esta tela para buscar, entrar ou criar grupos.
 */

import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
type GroupsScreenNavigationProp = NativeStackNavigationProp<any>;
export default function GroupsScreen({ navigation }: { navigation: GroupsScreenNavigationProp }) {
  const { groups } = useAuth();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Grupos" />
        <Appbar.Action icon="plus" onPress={() => navigation.navigate('CreateGroup')} />
      </Appbar.Header>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => navigation.navigate('GroupProfile', { groupId: item.id })}>
            <Card.Cover source={{ uri: item.coverImage }} />
            <Card.Content>
              <Title>{item.name}</Title>
              <Paragraph>{item.description}</Paragraph>
            </Card.Content>
            <Card.Actions>
                <Button>{`${item.members.length} membros`}</Button>
                <Button>Entrar no Grupo</Button>
            </Card.Actions>
          </Card>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: { marginBottom: 16 },
});
