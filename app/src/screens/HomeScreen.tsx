import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../hooks/useHousehold';
import { useListItems } from '../hooks/useListItems';
import { useInStoreSession } from '../hooks/useInStoreSession';
import { usePushTokenRegistration } from '../hooks/usePushTokenRegistration';
import { supabase } from '../lib/supabase';
import { APP_DISPLAY_NAME } from '../config/app';
import { useTheme } from '../contexts/ThemeContext';

type MainStackParamList = { Home: undefined; JoinByCode: undefined };
type Nav = NativeStackNavigationProp<MainStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { household, isLoading, error, createHousehold, updateHouseholdName, refetch } = useHousehold(user ?? null);
  const { todoItems, boughtItems, isLoading: listLoading, error: listError, refetch: refetchList, addItem, removeItem, markAsBought, markAsTodo } = useListItems(household?.id ?? null);
  const { activeSession, countdownRemainingSeconds, startSession, endSession, isLoading: sessionLoading } = useInStoreSession(household?.id ?? null, user?.id ?? null);
  usePushTokenRegistration(user?.id ?? null);
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createCode, setCreateCode] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [warningCountdownUntil, setWarningCountdownUntil] = useState<number | null>(null);
  const [startingWarning, setStartingWarning] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [unmarkingId, setUnmarkingId] = useState<string | null>(null);
  const [deletingBoughtId, setDeletingBoughtId] = useState<string | null>(null);
  const [startingSession, setStartingSession] = useState(false);
  const [endingSession, setEndingSession] = useState(false);
  const [inStoreModalVisible, setInStoreModalVisible] = useState(false);
  const [inStoreMinutes, setInStoreMinutes] = useState<5 | 10 | 20>(10);
  const [inStoreBlockAdding, setInStoreBlockAdding] = useState(true);

  const handleCreateHousehold = async () => {
    const name = createName.trim();
    const code = createCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('Błąd', 'Podaj kod zaproszenia (np. ADAM).');
      return;
    }
    setCreating(true);
    const { error: createError } = await createHousehold(name, code);
    setCreating(false);
    if (createError) {
      Alert.alert('Błąd', createError);
    }
  };

  useEffect(() => {
    if (household) {
      navigation.setOptions({
        title: APP_DISPLAY_NAME,
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity
            onPress={toggleTheme}
            style={{ paddingHorizontal: 16, paddingVertical: 8 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={isDark ? 'Motyw jasny' : 'Motyw ciemny'}
          >
            <Text style={{ fontSize: 22, color: colors.primary }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={{ paddingHorizontal: 16, paddingVertical: 8 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ fontSize: 22, color: colors.primary }}>☰</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [household, navigation, colors.primary, isDark, toggleTheme]);

  const handleCopyCode = async () => {
    if (!household?.invite_code) return;
    try {
      await Clipboard.setStringAsync(household.invite_code);
      Alert.alert('Skopiowano', 'Kod zaproszenia skopiowany do schowka.');
    } catch {
      Alert.alert('Błąd', 'Nie udało się skopiować kodu.');
    }
  };

  const handleAddItem = async () => {
    const trimmed = newItemLabel.trim();
    if (!trimmed) return;
    setAdding(true);
    const { error: addError } = await addItem(trimmed);
    setAdding(false);
    if (addError) {
      Alert.alert('Błąd', addError);
    } else {
      setNewItemLabel('');
    }
  };

  const handleRemoveItem = (item: { id: string; label: string }) => {
    Alert.alert('Usuń pozycję', `Usunąć „${item.label}"?`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(item.id);
          const { error: delError } = await removeItem(item.id);
          setDeletingId(null);
          if (delError) Alert.alert('Błąd', delError);
        },
      },
    ]);
  };

  const handleMarkAsBought = async (id: string) => {
    setMarkingId(id);
    const { error: markError } = await markAsBought(id);
    setMarkingId(null);
    if (markError) Alert.alert('Błąd', markError);
  };

  const handleRemoveBoughtItem = (item: { id: string; label: string }) => {
    Alert.alert('Usuń pozycję', `Usunąć „${item.label}" z listy?`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          setDeletingBoughtId(item.id);
          const { error: delError } = await removeItem(item.id);
          setDeletingBoughtId(null);
          if (delError) Alert.alert('Błąd', delError);
        },
      },
    ]);
  };

  const handleUnmarkBought = async (id: string) => {
    setUnmarkingId(id);
    const { error: err } = await markAsTodo(id);
    setUnmarkingId(null);
    if (err) Alert.alert('Błąd', err);
  };

  const handleStartInStore = () => {
    setInStoreModalVisible(true);
  };

  const confirmStartInStore = () => {
    setInStoreModalVisible(false);
    runStartSession(inStoreMinutes, inStoreBlockAdding);
  };

  const runStartSession = async (minutes: number, blockAdding: boolean = true) => {
    setStartingSession(true);
    const { error: sessionError } = await startSession(minutes, blockAdding);
    setStartingSession(false);
    if (sessionError) {
      Alert.alert('Błąd', sessionError);
      return;
    }
    if (household?.id && user?.id) {
      try {
        await supabase.functions.invoke('send-in-store-push', {
          body: {
            householdId: household.id,
            shopperUserId: user.id,
            countdownMinutes: minutes,
          },
        });
      } catch {
        // Best-effort push
      }
    }
  };

  const handleGoingSoon = async () => {
    if (!household?.id || !user?.id) return;
    setStartingWarning(true);
    try {
      await supabase.functions.invoke('send-shopping-warning-push', {
        body: { householdId: household.id, senderUserId: user.id },
      });
    } catch {
      // Best-effort
    }
    setStartingWarning(false);
    setWarningCountdownUntil(Date.now() + 15 * 60 * 1000);
  };

  const cancelWarningCountdown = () => setWarningCountdownUntil(null);

  useEffect(() => {
    if (warningCountdownUntil == null) return undefined;
    const interval = setInterval(() => {
      if (Date.now() >= warningCountdownUntil) {
        setWarningCountdownUntil(null);
        runStartSession(25, true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [warningCountdownUntil]);

  const warningRemainingSeconds =
    warningCountdownUntil != null
      ? Math.max(0, Math.floor((warningCountdownUntil - Date.now()) / 1000))
      : 0;

  const handleEndSession = async () => {
    setEndingSession(true);
    const { error: endError } = await endSession();
    setEndingSession(false);
    if (endError) Alert.alert('Błąd', endError);
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isAddBlocked = Boolean(
    activeSession &&
    activeSession.block_adding &&
    user?.id &&
    activeSession.user_id !== user.id
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Ładowanie…</Text>
      </View>
    );
  }

  if (error && !household) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => refetch()}>
          <Text style={[styles.buttonText, { color: colors.primary }]}>Odśwież</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!household) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Lista zakupów</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Zalogowano: {user?.email ?? '—'}</Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>Załóż gospodarstwo (nazwa + kod, np. ADAM) lub dołącz kodem.</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="Nazwa gospodarstwa (np. Adamczewscy)"
          placeholderTextColor={colors.textSecondary}
          value={createName}
          onChangeText={setCreateName}
          editable={!creating}
        />
        <TextInput
          style={[styles.input, { marginTop: 8, backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="Kod zaproszenia (np. ADAM)"
          placeholderTextColor={colors.textSecondary}
          value={createCode}
          onChangeText={(t) => setCreateCode(t.toUpperCase())}
          autoCapitalize="characters"
          maxLength={12}
          editable={!creating}
        />
        <TouchableOpacity
          style={[styles.primaryButton, (creating || !createCode.trim()) && styles.buttonDisabled, { backgroundColor: colors.primary }]}
          onPress={handleCreateHousehold}
          disabled={creating || !createCode.trim()}
        >
          {creating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Utwórz gospodarstwo</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.primary }]}
          onPress={() => navigation.navigate('JoinByCode')}
          disabled={creating}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Mam kod zaproszenia</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => signOut()}>
          <Text style={[styles.buttonText, { color: colors.primary }]}>Wyloguj</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentWrap}>
      <Text style={[styles.title, { color: colors.text }]}>{household.name || 'Lista zakupów'}</Text>

      {activeSession ? (
        <View style={styles.countdownBlock}>
          <Text style={styles.countdownTitle}>Zakupy w toku</Text>
          <Text style={styles.countdownText}>
            Pozostało: {formatCountdown(countdownRemainingSeconds)}
          </Text>
          {activeSession.user_id === user?.id && (
            <TouchableOpacity
              style={[styles.endSessionButton, endingSession && styles.buttonDisabled]}
              onPress={handleEndSession}
              disabled={endingSession}
            >
              {endingSession ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.endSessionButtonText}>Zakończ zakupy</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      ) : warningCountdownUntil != null ? (
        <View style={styles.warningBlock}>
          <Text style={styles.countdownTitle}>Za chwilę idę na zakupy</Text>
          <Text style={styles.countdownText}>
            Pozostało na dopisanie: {formatCountdown(warningRemainingSeconds)}
          </Text>
          <Text style={styles.hint}>Potem automatycznie włączy się „W sklepie" na 25 min.</Text>
          <TouchableOpacity style={styles.cancelWarningButton} onPress={cancelWarningCountdown}>
            <Text style={styles.cancelWarningButtonText}>Anuluj</Text>
          </TouchableOpacity>
        </View>
      ) : !sessionLoading ? (
        <View style={styles.inStoreRow}>
          <TouchableOpacity
            style={[styles.inStoreButton, startingSession && styles.buttonDisabled]}
            onPress={handleStartInStore}
            disabled={startingSession}
          >
            {startingSession ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.inStoreButtonText}>W sklepie</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.goingSoonButton, startingWarning && styles.buttonDisabled]}
            onPress={handleGoingSoon}
            disabled={startingWarning}
          >
            {startingWarning ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.goingSoonButtonText}>Za chwilę idę na zakupy!</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      {listLoading ? (
        <ActivityIndicator size="small" style={styles.listLoader} />
      ) : listError ? (
        <View style={styles.listErrorBlock}>
          <Text style={[styles.errorText, { color: colors.error }]}>{listError}</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>Nie udało się załadować listy.</Text>
          <TouchableOpacity style={styles.button} onPress={() => refetchList()}>
            <Text style={[styles.buttonText, { color: colors.primary }]}>Odśwież listę</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Do kupienia</Text>
          {isAddBlocked ? (
            <View style={[styles.addBlockedBlock, { backgroundColor: colors.rowBg }]}>
              <Text style={[styles.addBlockedText, { color: colors.error }]}>
                Zakupy w toku. Nie możesz teraz dopisywać do listy.
              </Text>
            </View>
          ) : (
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                placeholder="Nazwa pozycji…"
                placeholderTextColor={colors.textSecondary}
                value={newItemLabel}
                onChangeText={setNewItemLabel}
                onSubmitEditing={handleAddItem}
                returnKeyType="done"
                editable={!adding}
              />
              <TouchableOpacity
                style={[styles.addButton, adding && styles.buttonDisabled, { backgroundColor: colors.primary }]}
                onPress={handleAddItem}
                disabled={adding || !newItemLabel.trim()}
              >
                {adding ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                  <Text style={styles.addButtonText}>Dodaj</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          {todoItems.length === 0 ? (
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>Brak pozycji na liście.</Text>
          ) : (
            todoItems.map((item) => (
              <View key={item.id} style={[styles.listRow, { backgroundColor: colors.rowBg }]}>
                <Text style={[styles.listLabel, { color: colors.text }]}>{item.label}</Text>
                <TouchableOpacity
                  style={styles.markBoughtButton}
                  onPress={() => handleMarkAsBought(item.id)}
                  disabled={markingId === item.id}
                >
                  {markingId === item.id ? (
                    <ActivityIndicator size="small" color="#16a34a" />
                  ) : (
                    <Text style={styles.markBoughtButtonText}>Odhacz</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleRemoveItem(item)}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? (
                    <ActivityIndicator size="small" color="#b91c1c" />
                  ) : (
                    <Text style={styles.deleteButtonText}>Usuń</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}

          <Text style={[styles.sectionTitle, styles.sectionTitleKupione, { color: colors.success }]}>Kupione</Text>
          {boughtItems.length === 0 ? (
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>Brak odhaczonych pozycji.</Text>
          ) : (
            boughtItems.map((item) => (
              <View key={item.id} style={[styles.listRowBought, { backgroundColor: colors.rowBoughtBg }]}>
                <Text style={[styles.listLabelBought, { color: colors.success }]}>{item.label}</Text>
                <TouchableOpacity
                  style={styles.boughtActionButton}
                  onPress={() => handleUnmarkBought(item.id)}
                  disabled={unmarkingId === item.id}
                >
                  {unmarkingId === item.id ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={[styles.boughtActionButtonText, { color: colors.primary }]}>Odznacz</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.boughtActionButton}
                  onPress={() => handleRemoveBoughtItem(item)}
                  disabled={deletingBoughtId === item.id}
                >
                  {deletingBoughtId === item.id ? (
                    <ActivityIndicator size="small" color={colors.error} />
                  ) : (
                    <Text style={[styles.boughtActionButtonText, { color: colors.error }]}>Usuń</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
        </>
      )}
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={[styles.menuOverlay, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuCard, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>Menu</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Kod zaproszenia</Text>
            <Text style={[styles.code, { color: colors.text }]}>{household.invite_code}</Text>
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={() => { handleCopyCode(); setMenuVisible(false); }}>
              <Text style={styles.primaryButtonText}>Kopiuj kod</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => {
                setEditNameValue(household.name);
                setEditNameVisible(true);
                setMenuVisible(false);
              }}
            >
              <Text style={[styles.linkButtonText, { color: colors.primary }]}>Edytuj nazwę gospodarstwa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setMenuVisible(false);
                signOut();
              }}
            >
              <Text style={[styles.buttonText, { color: colors.primary }]}>Wyloguj</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={editNameVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditNameVisible(false)}
      >
        <KeyboardAvoidingView
          style={[styles.menuOverlay, { backgroundColor: colors.overlay }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={[styles.editNameCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>Nazwa gospodarstwa</Text>
            <TextInput
              style={[styles.editNameInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              value={editNameValue}
              onChangeText={setEditNameValue}
              placeholder="np. Adamczewscy"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            <View style={styles.editNameRow}>
              <TouchableOpacity
                style={[styles.editNameButton, styles.editNameButtonSecondary, { borderColor: colors.primary }]}
                onPress={() => setEditNameVisible(false)}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Anuluj</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editNameButton, styles.editNameButtonPrimary, { backgroundColor: colors.primary }]}
                onPress={async () => {
                  const { error: err } = await updateHouseholdName(editNameValue);
                  setEditNameVisible(false);
                  if (err) Alert.alert('Błąd', err);
                }}
              >
                <Text style={styles.primaryButtonText}>Zapisz</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={inStoreModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInStoreModalVisible(false)}
      >
        <TouchableOpacity
          style={[styles.menuOverlay, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={() => setInStoreModalVisible(false)}
        >
          <View style={[styles.inStoreModalCard, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>W sklepie</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Czas odliczania</Text>
            <View style={styles.inStoreTimeRow}>
              {([5, 10, 20] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.inStoreTimeOption,
                    inStoreMinutes === m && styles.inStoreTimeOptionActive,
                    { backgroundColor: inStoreMinutes === m ? colors.primaryTint : colors.rowBg, borderColor: inStoreMinutes === m ? colors.primary : colors.border },
                  ]}
                  onPress={() => setInStoreMinutes(m)}
                >
                  <Text
                    style={[
                      styles.inStoreTimeOptionText,
                      inStoreMinutes === m && styles.inStoreTimeOptionTextActive,
                      { color: inStoreMinutes === m ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {m} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.inStoreSwitchRow}>
              <Text style={[styles.inStoreSwitchLabel, { color: colors.text }]}>Blokuj dopisywanie do listy</Text>
              <Switch
                value={inStoreBlockAdding}
                onValueChange={setInStoreBlockAdding}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={inStoreBlockAdding ? colors.primary : colors.textSecondary}
              />
            </View>
            <View style={styles.editNameRow}>
              <TouchableOpacity
                style={[styles.editNameButton, styles.editNameButtonSecondary, { borderColor: colors.primary }]}
                onPress={() => setInStoreModalVisible(false)}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Anuluj</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editNameButton, styles.editNameButtonPrimary, { backgroundColor: colors.primary }]}
                onPress={confirmStartInStore}
              >
                <Text style={styles.primaryButtonText}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  contentWrap: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  countdownBlock: {
    backgroundColor: '#fef3c7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  countdownText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#92400e',
    marginTop: 4,
  },
  endSessionButton: {
    backgroundColor: '#b45309',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  endSessionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  inStoreButton: {
    flex: 1,
    backgroundColor: '#ea580c',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  inStoreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inStoreRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 12,
    marginBottom: 16,
  },
  goingSoonButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  goingSoonButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  warningBlock: {
    backgroundColor: '#dbeafe',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  cancelWarningButton: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelWarningButtonText: {
    color: '#1d4ed8',
    fontSize: 16,
    fontWeight: '600',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  editNameCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  editNameInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  editNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  editNameButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editNameButtonPrimary: {
    backgroundColor: '#2563eb',
  },
  editNameButtonSecondary: {
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  inStoreModalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  inStoreTimeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  inStoreTimeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inStoreTimeOptionActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  inStoreTimeOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  inStoreTimeOptionTextActive: {
    color: '#2563eb',
  },
  inStoreSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inStoreSwitchLabel: {
    fontSize: 15,
    color: '#334155',
    flex: 1,
    marginRight: 12,
  },
  listLoader: {
    marginVertical: 16,
  },
  listErrorBlock: {
    marginVertical: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitleKupione: {
    marginTop: 24,
    color: '#16a34a',
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addBlockedBlock: {
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  addBlockedText: {
    fontSize: 14,
    color: '#b91c1c',
    textAlign: 'center',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 6,
  },
  listLabel: {
    fontSize: 16,
    flex: 1,
  },
  markBoughtButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 64,
    alignItems: 'center',
  },
  markBoughtButtonText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 56,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  listRowBought: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    marginBottom: 6,
  },
  listLabelBought: {
    fontSize: 16,
    color: '#166534',
    textDecorationLine: 'line-through',
    flex: 1,
  },
  boughtActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 64,
    alignItems: 'center',
  },
  boughtActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inviteBlock: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  code: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    fontStyle: 'italic',
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
  secondaryButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  buttonText: {
    color: '#2563eb',
    fontSize: 16,
  },
  linkButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  linkButtonText: {
    color: '#2563eb',
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    color: '#b91c1c',
    textAlign: 'center',
    marginBottom: 16,
  },
});
