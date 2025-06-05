import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Image, TouchableOpacity, Alert, Modal, TextInput, Button, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  // Stati per nuovo utente
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [dataNascita, setDataNascita] = useState('');
  const [avatar, setAvatar] = useState('');

  const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://68396ab16561b8d882b04ef6.mockapi.io/Utente');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error('Errore nel fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchData();
    } catch (error) {
      console.error('Errore nel refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const deleteUser = async (id) => {
    try {
      await fetch("https://68396ab16561b8d882b04ef6.mockapi.io/Utente/${id}", {
        method: 'DELETE',
      });
      setData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      Alert.alert('Errore', 'Impossibile eliminare l\'utente.');
      console.error('Errore nella cancellazione:', error);
    }
  };

  const addUser = async () => {
    if (!nome || !cognome || !dataNascita) {
      Alert.alert('Attenzione', 'Compila nome, cognome e data di nascita.');
      return;
    }

    try {
      const newUser = {
        nome,
        cognome,
        dataNascita,
        avatar: avatar || defaultAvatar,
      };

      const response = await fetch('https://68396ab16561b8d882b04ef6.mockapi.io/Utente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const createdUser = await response.json();
      setData((prevData) => [createdUser, ...prevData]);
      setModalVisible(false);

      // Reset dei campi
      setNome('');
      setCognome('');
      setDataNascita('');
      setAvatar('');
    } catch (error) {
      Alert.alert('Errore', 'Impossibile aggiungere l\'utente.');
      console.error('Errore nell\'inserimento:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.avatar || defaultAvatar }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.nome} {item.cognome}</Text>
        <Text style={styles.birth}>Data di nascita: {new Date(item.dataNascita).toLocaleDateString()}</Text>
        <Text style={styles.id}>ID: {item.id}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteUser(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lista Utenti</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={36} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>Aggiungi Nuovo Utente</Text>

              <TextInput
                placeholder="Nome"
                style={styles.input}
                value={nome}
                onChangeText={setNome}
              />
              <TextInput
                placeholder="Cognome"
                style={styles.input}
                value={cognome}
                onChangeText={setCognome}
              />
              <TextInput
                placeholder="Data di nascita (yyyy-mm-dd)"
                style={styles.input}
                value={dataNascita}
                onChangeText={setDataNascita}
              />
              <TextInput
                placeholder="URL Avatar (facoltativo)"
                style={styles.input}
                value={avatar}
                onChangeText={setAvatar}
              />

              <View style={styles.modalButtons}>
                <Button title="Annulla" onPress={() => setModalVisible(false)} color="#888" />
                <Button title="Aggiungi" onPress={addUser} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 5,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  birth: {
    fontSize: 14,
    color: '#666',
  },
  id: {
    fontSize: 12,
    color: '#aaa',
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});