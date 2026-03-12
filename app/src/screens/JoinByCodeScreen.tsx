import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../hooks/useHousehold';

export default function JoinByCodeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { joinHouseholdByCode } = useHousehold(user ?? null);
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    const { household, error: joinError } = await joinHouseholdByCode(code);
    setJoining(false);
    if (joinError) {
      Alert.alert('Błąd', joinError);
      return;
    }
    if (household) {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.title}>Dołącz do gospodarstwa</Text>
      <Text style={styles.hint}>Wpisz kod zaproszenia od domownika (np. ABC123).</Text>
      <TextInput
        style={styles.input}
        placeholder="Kod zaproszenia"
        placeholderTextColor="#999"
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={12}
        editable={!joining}
      />
      <TouchableOpacity
        style={[styles.primaryButton, (joining || !code.trim()) && styles.buttonDisabled]}
        onPress={handleJoin}
        disabled={joining || !code.trim()}
      >
        {joining ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Dołącz</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()} disabled={joining}>
        <Text style={styles.buttonText}>Anuluj</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  button: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  buttonText: {
    color: '#2563eb',
    fontSize: 16,
  },
});
