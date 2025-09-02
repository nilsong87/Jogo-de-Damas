import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Appbar, Searchbar, List, Chip, Text, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { model } from '../services/geminiService';

// Mock data for discoverable items
const discoverData = [
  { id: '1', type: 'user', title: 'Alice', styles: ['Pop'], instruments: ['Teclado'] },
  { id: '2', type: 'user', title: 'Usuário MusiConnect', styles: ['Rock'], instruments: ['Guitarra'] },
  { id: '3', type: 'artist', title: 'Daft Punk', styles: ['Eletrônica'], instruments: [] },
  { id: '4', type: 'band', title: 'The Beatles', styles: ['Rock'], instruments: ['Guitarra', 'Baixo', 'Bateria'] },
  { id: '5', type: 'band', title: 'Queen', styles: ['Rock'], instruments: ['Vocal', 'Guitarra', 'Bateria'] },
];

const estilos = ['Rock', 'Pop', 'Eletrônica', 'Hip Hop', 'Jazz', 'Sertanejo'];
const instrumentos = ['Guitarra', 'Baixo', 'Bateria', 'Teclado', 'Vocal', 'Violino', 'Saxofone'];

const getIcon = (type: string) => {
    switch (type) {
        case 'song': return 'music-note';
        case 'artist': return 'account-music';
        case 'user': return 'account';
        default: return 'magnify';
    }
}

export default function DiscoverScreen() {
  const { user, posts } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstilo, setSelectedEstilo] = useState<string | null>(null);
  const [selectedInstrumento, setSelectedInstrumento] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState(discoverData);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const onChangeSearch = (query: string) => {
    try {
      setSearchQuery(query);
      filtrar(query, selectedEstilo, selectedInstrumento);
    } catch (error) {
      console.error("Erro em onChangeSearch: ", error);
    }
  };

  const filtrar = (query: string, estilo: string | null, instrumento: string | null) => {
    try {
      let newData = discoverData;
      if (query) {
        const textData = query.toUpperCase();
        newData = newData.filter((item) => item.title.toUpperCase().includes(textData));
      }
      if (estilo) {
        newData = newData.filter((item) => item.styles && item.styles.includes(estilo));
      }
      if (instrumento) {
        newData = newData.filter((item) => item.instruments && item.instruments.includes(instrumento));
      }
      setFilteredData(newData);
    } catch (error) {
      console.error("Erro em filtrar: ", error);
    }
  };

  const onSelectEstilo = (estilo: string) => {
    try {
      const novo = selectedEstilo === estilo ? null : estilo;
      setSelectedEstilo(novo);
      filtrar(searchQuery, novo, selectedInstrumento);
    } catch (error) {
      console.error("Erro em onSelectEstilo: ", error);
    }
  };

  const onSelectInstrumento = (inst: string) => {
    try {
      const novo = selectedInstrumento === inst ? null : inst;
      setSelectedInstrumento(novo);
      filtrar(searchQuery, selectedEstilo, novo);
    } catch (error) {
      console.error("Erro em onSelectInstrumento: ", error);
    }
  };

  const generateRecommendations = async () => {
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado para gerar recomendações.");
      return;
    }

    const userStyles = user.styles?.join(', ') || 'Nenhum';
    const userInstruments = user.instruments?.join(', ') || 'Nenhum';
    const userPosts = posts.slice(0, 5).map(p => p.text).join('\n');

    const prompt = `Baseado em um músico que gosta dos estilos ${userStyles}, toca ${userInstruments} e postou sobre ${userPosts}, sugira 5 novos estilos musicais para ele explorar. Retorne apenas uma lista separada por vírgulas.`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const generatedText = response.text();
      setRecommendations(generatedText.split(',').map(s => s.trim()));
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível gerar as recomendações.");
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Descobrir" />
      </Appbar.Header>
      <View style={styles.recommendationContainer}>
        <Text style={styles.filterTitle}>Descubra Novos Estilos com IA</Text>
        <Button onPress={generateRecommendations}>Gerar Recomendações</Button>
        {recommendations.length > 0 && (
          <View style={styles.chipContainer}>
            {recommendations.map((rec) => (
              <Chip key={rec} icon="music-note" style={styles.chip}>{rec}</Chip>
            ))}
          </View>
        )}
      </View>
      <Searchbar
        placeholder="Buscar por músicos, bandas, estilos..."
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      <Text style={styles.filterTitle}>Filtrar por Estilo Musical:</Text>
      <View style={styles.chipContainer}>
        {estilos.map((estilo) => (
          <Chip
            key={estilo}
            icon="music"
            selected={selectedEstilo === estilo}
            onPress={() => onSelectEstilo(estilo)}
            style={[styles.chip, selectedEstilo === estilo && styles.chipSelected]}
          >
            {estilo}
          </Chip>
        ))}
      </View>
      <Text style={styles.filterTitle}>Filtrar por Instrumento:</Text>
      <View style={styles.chipContainer}>
        {instrumentos.map((inst) => (
          <Chip
            key={inst}
            icon="guitar"
            selected={selectedInstrumento === inst}
            onPress={() => onSelectInstrumento(inst)}
            style={[styles.chip, selectedInstrumento === inst && styles.chipSelected]}
          >
            {inst}
          </Chip>
        ))}
      </View>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={`Estilos: ${(item.styles || []).join(', ')} | Instrumentos: ${(item.instruments || []).join(', ')}`}
            left={props => <List.Icon {...props} icon={getIcon(item.type)} />}
            onPress={() => console.log(`Tapped on ${item.title}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  recommendationContainer: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchbar: {
    margin: 8,
  },
  filterTitle: {
    fontWeight: 'bold',
    marginLeft: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  chip: {
    margin: 4,
  },
  chipSelected: {
    backgroundColor: '#e91e63',
    color: '#fff',
  },
});
