import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import JoinByCodeScreen from './src/screens/JoinByCodeScreen';
import { APP_DISPLAY_NAME } from './src/config/app';

const NativeStack = createNativeStackNavigator();
const WebStack = createStackNavigator();
const Stack = Platform.OS === 'web' ? WebStack : NativeStack;

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: APP_DISPLAY_NAME }} />
      <Stack.Screen
        name="JoinByCode"
        component={JoinByCodeScreen}
        options={{ title: 'Dołącz do gospodarstwa' }}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Ładowanie…</Text>
      </View>
    );
  }

  return user ? <MainStack /> : <AuthStack />;
}

function AppContent() {
  const { isDark, colors } = useTheme();
  const navTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };
  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});
