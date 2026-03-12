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
import { useTheme } from '../contexts/ThemeContext';
import { INVITE_CODE_MAX_LENGTH } from '../config/constants';

export default function JoinByCodeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
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
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.contentWrap}>
        <Text style={[styles.title, { color: colors.text }]}>Dołącz do gospodarstwa</Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Wpisz kod zaproszenia od domownika (np. ABC123).
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="Kod zaproszenia"
          placeholderTextColor={colors.textSecondary}
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={INVITE_CODE_MAX_LENGTH}
          editable={!joining}
          accessibilityLabel="Kod zaproszenia"
        />
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }, (joining || !code.trim()) && styles.buttonDisabled]}
          onPress={handleJoin}
          disabled={joining || !code.trim()}
          accessibilityLabel="Dołącz do gospodarstwa"
        >
          {joining ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>Dołącz</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()} disabled={joining} accessibilityLabel="Anuluj">
          <Text style={[styles.buttonText, { color: colors.primary }]}>Anuluj</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  contentWrap: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
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
    fontSize: 16,
  },
});
