/**
 * Tela de descoberta de músicos, bandas e grupos.
 *
 * Permite ao usuário buscar e explorar novos perfis e grupos.
 * Use esta tela para ampliar conexões e oportunidades.
 */


import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, Searchbar, List, Chip, Text } from 'react-native-paper';
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

const getTranslatedType = (type: string) => {
    switch (type) {
        case 'song': return 'Música';
        case 'artist': return 'Artista';
        case 'user': return 'Usuário';
        default: return type;
    }
}

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstilo, setSelectedEstilo] = useState<string | null>(null);
  const [selectedInstrumento, setSelectedInstrumento] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState(discoverData);

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    filtrar(query, selectedEstilo, selectedInstrumento);
  };

  const filtrar = (query: string, estilo: string | null, instrumento: string | null) => {
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
  };

  const onSelectEstilo = (estilo: string) => {
    const novo = selectedEstilo === estilo ? null : estilo;
    setSelectedEstilo(novo);
    filtrar(searchQuery, novo, selectedInstrumento);
  };

  const onSelectInstrumento = (inst: string) => {
    const novo = selectedInstrumento === inst ? null : inst;
    setSelectedInstrumento(novo);
    filtrar(searchQuery, selectedEstilo, novo);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Descobrir" />
      </Appbar.Header>
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
