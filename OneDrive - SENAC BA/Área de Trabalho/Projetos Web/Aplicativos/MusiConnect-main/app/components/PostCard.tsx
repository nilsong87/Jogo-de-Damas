/**
 * Componente PostCard
 *
 * Exibe um post com informações do autor, mídia, comentários e ações (editar, deletar, compartilhar).
 * Props:
 * - post: dados do post
 * - currentUser: usuário logado
 * - onEdit: função para editar post
 * - onDelete: função para deletar post
 * - onShare: função para compartilhar post
 *
 * Use este componente para renderizar posts no feed ou perfil.
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, FlatList } from 'react-native';
import { Card, Title, Paragraph, Avatar, Button, Subheading } from 'react-native-paper';
import { Post, User } from '../context/AuthContext';
import { getComments, addComment, Comment } from '../services/commentService';


interface PostCardProps {
    post: Post;
    currentUser: User | null;
    onEdit: (post: Post) => void;
    onDelete: (postId: string) => void;
    onShare: (post: Post) => void;
}

export default function PostCard({ post, currentUser, onEdit, onDelete, onShare }: PostCardProps) {
    const isOwnPost = post.author.handle === currentUser?.handle;
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        setLoading(true);
        const data = await getComments(post.id);
        setComments(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || !currentUser) return;
        setLoading(true);
        await addComment(post.id, {
            author: currentUser,
            text: commentText,
            timestamp: new Date().toISOString(),
        });
        setCommentText('');
        await fetchComments();
        setLoading(false);
    };

    return (
        <Card style={styles.card}>
            {post.originalAuthor && (
                <Card.Title 
                    title={`${post.author.name} compartilhou`}
                    left={(props: any) => <Avatar.Image {...props} size={24} source={{ uri: post.author.avatar }} />}
                    style={styles.sharedHeader}
                />
            )}
            <Card.Title
                title={post.originalAuthor?.name || post.author.name}
                subtitle={`@${post.originalAuthor?.handle || post.author.handle} · ${post.timestamp}`}
                left={(props: any) => <Avatar.Image {...props} source={{ uri: post.originalAuthor?.avatar || post.author.avatar }} />}
            />
            <Card.Content>
                <Paragraph children={post.text} />
                {post.image && <Card.Cover source={{ uri: post.image }} style={styles.cardCover} />}
                {post.music && (
                    <Card.Title 
                        title={post.music.title} 
                        subtitle={post.music.artist} 
                        left={(props: any) => <Avatar.Icon {...props} icon="music" />} 
                    />
                )}
                {/* Comentários */}
                <View style={styles.commentsContainer}>
                    <Subheading>Comentários</Subheading>
                    <FlatList
                        data={comments}
                        keyExtractor={(item: Comment) => item.id ? item.id : String(item.timestamp)}
                        renderItem={({ item }: { item: Comment }) => (
                            <View style={styles.commentItem}>
                                <Avatar.Image size={32} source={{ uri: item.author?.avatar || 'https://i.pravatar.cc/150?u=default' }} />
                                <View style={{ marginLeft: 8 }}>
                                    <Paragraph children={item.author?.name || 'Usuário'} style={{ fontWeight: 'bold' }} />
                                    <Paragraph children={item.text} />
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={<Paragraph children="Nenhum comentário ainda." style={{ color: 'gray' }} />}
                        style={{ maxHeight: 120 }}
                    />
                    <View style={styles.commentInputRow}>
                        <TextInput
                            placeholder="Escreva um comentário..."
                            value={commentText}
                            onChangeText={setCommentText}
                            style={styles.commentInput}
                        />
                        <Button onPress={handleAddComment} loading={loading} disabled={!commentText.trim() || !currentUser}>
                            Comentar
                        </Button>
                    </View>
                </View>
            </Card.Content>
            <Card.Actions>
                {isOwnPost ? (
                    <>
                        <Button onPress={() => onEdit(post)}>Editar</Button>
                        <Button onPress={() => onDelete(post.id)}>Deletar</Button>
                    </>
                ) : (
                    <Button onPress={() => onShare(post)}>Compartilhar</Button>
                )}
            </Card.Actions>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: { marginHorizontal: 16, marginBottom: 16 },
    cardCover: { marginTop: 16 },
    sharedHeader: { 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee',
        paddingBottom: 8,
        marginBottom: 8,
    },
    commentsContainer: {
        marginTop: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 8,
    },
    commentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    commentInput: {
        flex: 1,
        marginRight: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 8,
    },
});
