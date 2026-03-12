import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { APP_DISPLAY_NAME, APP_ICON, APP_DESCRIPTION } from '../config/app';

type AuthStackParamList = { Login: undefined; Register: undefined };
type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Błąd', 'Wpisz e-mail i hasło.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      Alert.alert('Błąd logowania', error.message);
      return;
    }
    if (data.session) {
      // AuthContext updates → RootNavigator shows MainStack
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.contentWrap}>
        <View style={styles.brandRow}>
          <Text style={[styles.appIcon, { color: colors.primary }]}>{APP_ICON}</Text>
          <Text style={[styles.appName, { color: colors.text }]}>{APP_DISPLAY_NAME}</Text>
        </View>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>{APP_DESCRIPTION}</Text>
        <Text style={[styles.title, { color: colors.text }]}>Zaloguj się</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
          ]}
          placeholder="E-mail"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          editable={!loading}
          accessibilityLabel="E-mail"
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
          ]}
          placeholder="Hasło"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          editable={!loading}
          accessibilityLabel="Hasło"
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          accessibilityLabel="Zaloguj się"
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryText }]}>Zaloguj się</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register')} disabled={loading}>
          <Text style={[styles.linkText, { color: colors.primary }]}>Nie masz konta? Zarejestruj się</Text>
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  appIcon: {
    fontSize: 32,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
  },
});
