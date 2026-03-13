import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../hooks/useHousehold';
import { useListItems } from '../hooks/useListItems';
import { useInStoreSession } from '../hooks/useInStoreSession';
import { usePushTokenRegistration } from '../hooks/usePushTokenRegistration';
import { useSuggestedRecipes } from '../hooks/useSuggestedRecipes';
import { supabase } from '../lib/supabase';
import { APP_DISPLAY_NAME, APP_ICON } from '../config/app';
import {
  WARNING_COUNTDOWN_MINUTES,
  AUTO_IN_STORE_MINUTES,
  INVITE_CODE_MAX_LENGTH,
  LIST_ITEM_UNITS,
  DEFAULT_LIST_ITEM_UNIT,
} from '../config/constants';
import type { ListItem } from '../types/list';
import type { RecipeWithIngredients, RecipeIngredient } from '../types/recipe';
import { useTheme, THEME_PRESETS } from '../contexts/ThemeContext';
import { SHOPPING_CATEGORIES } from '../data/shoppingCategories';
import type { ShoppingCategory } from '../data/shoppingCategories';
import { getProductQuantityDefault, UNITS_BY_MODE, getStepForUnit } from '../data/productQuantityDefaults';
import { groupListByCategory } from '../lib/groupListByCategory';
import { groupListByRecipe } from '../lib/groupListByRecipe';
import { scaleIngredientQuantity } from '../lib/recipeServings';
import { useRecipes } from '../hooks/useRecipes';
import { computeRecipeCalories } from '../data/ingredientCalories';

import type { MainStackParamList } from '../navigation/types';
type Nav = NativeStackNavigationProp<MainStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user, signOut } = useAuth();
  const { colors, theme: themeId, setTheme, toggleLightDark, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = 96 + insets.bottom;
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
  const [, setCountdownTick] = useState(0); // setCountdownTick co 1s wymusza re-render, żeby timer się odświeżał
  const [startingWarning, setStartingWarning] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState(DEFAULT_LIST_ITEM_UNIT);
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
  const [categoryPickerCategory, setCategoryPickerCategory] = useState<ShoppingCategory | null>(null);
  const [addingCategoryProduct, setAddingCategoryProduct] = useState<string | null>(null);
  /** Ilość i jednostka per produkt w pickerze kategorii (klucz: productLabel). */
  const [categoryProductForm, setCategoryProductForm] = useState<Record<string, { quantity: string; unit: string }>>({});
  const { suggested: suggestedRecipes, isLoading: suggestedRecipesLoading } = useSuggestedRecipes(
    todoItems.map((i) => i.label),
    2
  );
  const [recipeModalRecipe, setRecipeModalRecipe] = useState<RecipeWithIngredients | null>(null);
  const [recipeModalSelectedIds, setRecipeModalSelectedIds] = useState<Set<string>>(new Set());
  const [recipeModalDesiredServings, setRecipeModalDesiredServings] = useState(4);
  const [addingRecipeIngredients, setAddingRecipeIngredients] = useState(false);
  const [listGroupBy, setListGroupBy] = useState<'category' | 'recipe' | 'alphabet'>('category');
  const [categoriesPanelOpen, setCategoriesPanelOpen] = useState(false);

  const { recipes } = useRecipes();
  const recipeIdToName = useMemo(() => new Map(recipes.map((r) => [r.id, r.name])), [recipes]);

  const drawRandomRecipe = () => {
    if (suggestedRecipes.length === 0) return;
    const random = suggestedRecipes[Math.floor(Math.random() * suggestedRecipes.length)];
    openRecipeModal(random);
  };

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
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 20, color: colors.primary }}>{APP_ICON}</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>{APP_DISPLAY_NAME}</Text>
          </View>
        ),
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity
            onPress={toggleLightDark}
            style={{ paddingHorizontal: 16, paddingVertical: 8 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={isDark ? 'Motyw jasny' : 'Motyw ciemny'}
          >
            <Text style={{ fontSize: 22, color: colors.primary }}>{isDark ? '🌙' : '☀️'}</Text>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={{ paddingHorizontal: 16, paddingVertical: 8 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Menu"
          >
            <Text style={{ fontSize: 22, color: colors.primary }}>☰</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [household, navigation, colors.primary, colors.text, isDark, toggleLightDark]);

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
    const q = parseFloat(newItemQuantity.replace(',', '.'));
    const quantity = Number.isFinite(q) && q > 0 ? q : 1;
    setAdding(true);
    const { error: addError } = await addItem(trimmed, quantity, newItemUnit);
    setAdding(false);
    if (addError) {
      Alert.alert('Błąd', addError);
    } else {
      setNewItemLabel('');
      setNewItemQuantity('1');
      setNewItemUnit(DEFAULT_LIST_ITEM_UNIT);
    }
  };

  const formatItemLine = (item: ListItem) => {
    const q = item.quantity;
    const u = item.unit || 'szt';
    if (q === 1 && u === 'szt') return item.label;
    const qStr = q % 1 === 0 ? String(Math.round(q)) : String(q);
    return `${item.label} (${qStr} ${u})`;
  };

  const openRecipeModal = (recipe: RecipeWithIngredients) => {
    setRecipeModalRecipe(recipe);
    setRecipeModalSelectedIds(new Set(recipe.ingredients.map((i) => i.id)));
    setRecipeModalDesiredServings(recipe.servings ?? 4);
  };

  const toggleRecipeIngredient = (id: string) => {
    setRecipeModalSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddRecipeIngredientsToList = async () => {
    if (!recipeModalRecipe || isAddBlocked) return;
    const toAdd = recipeModalRecipe.ingredients.filter((ing) => recipeModalSelectedIds.has(ing.id));
    if (toAdd.length === 0) return;
    const recipeServings = recipeModalRecipe.servings ?? 4;
    const desired = recipeModalDesiredServings;
    setAddingRecipeIngredients(true);
    for (const ing of toAdd) {
      const qty = scaleIngredientQuantity(ing.quantity, ing.unit, desired, recipeServings);
      await addItem(ing.ingredient_label, qty, ing.unit, recipeModalRecipe.id);
    }
    setAddingRecipeIngredients(false);
    setRecipeModalRecipe(null);
  };

  const getCategoryProductForm = (productLabel: string) => {
    const def = getProductQuantityDefault(productLabel);
    const allowed = UNITS_BY_MODE[def.unitMode];
    const saved = categoryProductForm[productLabel];
    if (saved && allowed.includes(saved.unit)) {
      return { quantity: saved.quantity, unit: saved.unit, allowedUnits: allowed };
    }
    return {
      quantity: String(def.defaultQuantity),
      unit: def.defaultUnit,
      allowedUnits: allowed,
    };
  };

  const setCategoryProductQtyUnit = (productLabel: string, quantity: string, unit: string) => {
    setCategoryProductForm((prev) => ({ ...prev, [productLabel]: { quantity, unit } }));
  };

  const setCategoryProductUnit = (productLabel: string, newUnit: string) => {
    const { quantity, unit: oldUnit } = getCategoryProductForm(productLabel);
    const num = parseFloat(quantity.replace(',', '.')) || 0;
    let newQty = num;
    if (oldUnit === 'g' && newUnit === 'kg') newQty = num / 1000;
    else if (oldUnit === 'kg' && newUnit === 'g') newQty = num * 1000;
    else if (oldUnit === 'ml' && newUnit === 'l') newQty = num / 1000;
    else if (oldUnit === 'l' && newUnit === 'ml') newQty = num * 1000;
    const str = newQty % 1 === 0 ? String(Math.round(newQty)) : String(Math.round(newQty * 1000) / 1000);
    setCategoryProductQtyUnit(productLabel, str, newUnit);
  };

  const adjustCategoryProductQty = (productLabel: string, delta: number) => {
    const { quantity, unit } = getCategoryProductForm(productLabel);
    const step = getStepForUnit(unit);
    const num = parseFloat(quantity.replace(',', '.')) || 0;
    const next = Math.max(0, Math.round((num + delta * step) * 1000) / 1000);
    const nextStr = next % 1 === 0 ? String(next) : String(next);
    setCategoryProductQtyUnit(productLabel, nextStr, unit);
  };

  const handleAddFromCategory = async (productLabel: string) => {
    if (isAddBlocked) {
      Alert.alert('Zakupy w toku', 'Nie możesz teraz dopisywać do listy.');
      return;
    }
    const { quantity: qStr, unit } = getCategoryProductForm(productLabel);
    const q = parseFloat(qStr.replace(',', '.'));
    const quantity = Number.isFinite(q) && q > 0 ? q : 1;
    const safeUnit = LIST_ITEM_UNITS.includes(unit as typeof LIST_ITEM_UNITS[number]) ? unit : 'szt';
    setAddingCategoryProduct(productLabel);
    const { error: addError } = await addItem(productLabel, quantity, safeUnit);
    setAddingCategoryProduct(null);
    if (addError) Alert.alert('Błąd', addError);
  };

  const handleRemoveItem = async (item: { id: string; label: string }) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (!window.confirm(`Usunąć „${item.label}"?`)) return;
      setDeletingId(item.id);
      const { error: delError } = await removeItem(item.id);
      setDeletingId(null);
      if (delError) Alert.alert('Błąd', delError);
      return;
    }
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

  const handleRemoveBoughtItem = async (item: { id: string; label: string }) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (!window.confirm(`Usunąć „${item.label}" z listy?`)) return;
      setDeletingBoughtId(item.id);
      const { error: delError } = await removeItem(item.id);
      setDeletingBoughtId(null);
      if (delError) Alert.alert('Błąd', delError);
      return;
    }
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

  const runStartSession = useCallback(
    async (minutes: number, blockAdding: boolean = true) => {
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
    },
    [startSession, household?.id, user?.id]
  );

  const confirmStartInStore = () => {
    setInStoreModalVisible(false);
    runStartSession(inStoreMinutes, inStoreBlockAdding);
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
    setWarningCountdownUntil(Date.now() + WARNING_COUNTDOWN_MINUTES * 60 * 1000);
  };

  const cancelWarningCountdown = () => setWarningCountdownUntil(null);

  useEffect(() => {
    if (warningCountdownUntil == null) return undefined;
    const interval = setInterval(() => {
      if (Date.now() >= warningCountdownUntil) {
        setWarningCountdownUntil(null);
        runStartSession(AUTO_IN_STORE_MINUTES, true);
      } else {
        setCountdownTick((t) => t + 1); // re-render co sekundę, żeby timer się zmniejszał na ekranie
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [warningCountdownUntil, runStartSession]);

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
          maxLength={INVITE_CODE_MAX_LENGTH}
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
    <View style={styles.screenWrap}>
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]}
      showsVerticalScrollIndicator={true}
      bounces={true}
      keyboardShouldPersistTaps="handled"
    >
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
          <Text style={[styles.hint, { color: colors.textSecondary }]}>Potem automatycznie włączy się „W sklepie" na {AUTO_IN_STORE_MINUTES} min.</Text>
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
            accessibilityLabel="W sklepie"
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
            accessibilityLabel="Za chwilę idę na zakupy"
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
          {!isAddBlocked && (
            <>
              <TouchableOpacity
                style={[styles.categoriesCollapseRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setCategoriesPanelOpen((v) => !v)}
                accessibilityLabel={categoriesPanelOpen ? 'Zwiń kategorie' : 'Dodaj składnik z kategorii'}
                accessibilityState={{ expanded: categoriesPanelOpen }}
              >
                <Text style={[styles.categoriesCollapseLabel, { color: colors.text }]}>Dodaj z kategorii</Text>
                <Text style={[styles.categoriesCollapseChevron, { color: colors.textSecondary }]}>{categoriesPanelOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {categoriesPanelOpen && (
                <View style={styles.categoriesSection}>
                  <Text style={[styles.categoriesHint, { color: colors.textSecondary }]}>Kliknij kategorię i wybierz produkt do dodania</Text>
                  <View style={styles.categoriesWrap}>
                    {SHOPPING_CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.categoryChip, { backgroundColor: colors.rowBg, borderColor: colors.border }]}
                        onPress={() => setCategoryPickerCategory(cat)}
                        activeOpacity={0.7}
                        accessibilityLabel={`Kategoria: ${cat.name}`}
                      >
                        <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                        <Text style={[styles.categoryChipLabel, { color: colors.text }]} numberOfLines={2}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
          {!suggestedRecipesLoading && suggestedRecipes.length > 0 && (
            <View style={styles.suggestedRecipesSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Możesz zrobić</Text>
              <Text style={[styles.categoriesHint, { color: colors.textSecondary }]}>
                Masz na liście składniki do tych przepisów
              </Text>
              <TouchableOpacity
                style={[styles.drawRecipeButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={drawRandomRecipe}
                accessibilityLabel="Wylosuj przepis na podstawie składników z koszyka"
              >
                <Text style={styles.drawRecipeButtonIcon}>🎲</Text>
                <Text style={[styles.drawRecipeButtonText, { color: colors.primaryText }]}>Wylosuj przepis</Text>
              </TouchableOpacity>
              <View style={styles.suggestedRecipesWrap}>
                {suggestedRecipes.map((r) => {
                  const computed = computeRecipeCalories(r.ingredients, r.servings ?? 4);
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.recipeChip, { backgroundColor: colors.primaryTint, borderColor: colors.primary }]}
                      onPress={() => openRecipeModal(r)}
                      accessibilityLabel={`Przepis: ${r.name}`}
                    >
                      <Text style={[styles.recipeChipText, { color: colors.text }]} numberOfLines={2}>{r.name}</Text>
                      {computed != null && (
                        <Text style={[styles.recipeChipKcal, { color: colors.textSecondary }]}>~{computed.kcalPerServing} kcal/porcję</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
          <View style={[styles.listSortDivider, { borderTopColor: colors.border }]}>
            <Text style={[styles.listSortLabel, { color: colors.textSecondary }]}>Sortowanie listy</Text>
            <View style={styles.listGroupByRow}>
              <TouchableOpacity
                style={[styles.listGroupByButton, listGroupBy === 'category' && styles.listGroupByButtonActive, { borderColor: colors.border, backgroundColor: listGroupBy === 'category' ? colors.primaryTint : colors.rowBg }]}
                onPress={() => setListGroupBy('category')}
                accessibilityLabel="Grupuj po kategoriach"
                accessibilityState={{ selected: listGroupBy === 'category' }}
              >
                <Text style={[styles.listGroupByLabel, { color: listGroupBy === 'category' ? colors.primary : colors.textSecondary }]}>Po kategoriach</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.listGroupByButton, listGroupBy === 'recipe' && styles.listGroupByButtonActive, { borderColor: colors.border, backgroundColor: listGroupBy === 'recipe' ? colors.primaryTint : colors.rowBg }]}
                onPress={() => setListGroupBy('recipe')}
                accessibilityLabel="Grupuj po przepisach"
                accessibilityState={{ selected: listGroupBy === 'recipe' }}
              >
                <Text style={[styles.listGroupByLabel, { color: listGroupBy === 'recipe' ? colors.primary : colors.textSecondary }]}>Po przepisach</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.listGroupByButton, listGroupBy === 'alphabet' && styles.listGroupByButtonActive, { borderColor: colors.border, backgroundColor: listGroupBy === 'alphabet' ? colors.primaryTint : colors.rowBg }]}
                onPress={() => setListGroupBy('alphabet')}
                accessibilityLabel="Sortuj alfabetycznie"
                accessibilityState={{ selected: listGroupBy === 'alphabet' }}
              >
                <Text style={[styles.listGroupByLabel, { color: listGroupBy === 'alphabet' ? colors.primary : colors.textSecondary }]}>Alfabetycznie</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Do kupienia</Text>
          {isAddBlocked ? (
            <View style={[styles.addBlockedBlock, { backgroundColor: colors.rowBg }]}>
              <Text style={[styles.addBlockedText, { color: colors.error }]}>
                Zakupy w toku. Nie możesz teraz dopisywać do listy.
              </Text>
            </View>
          ) : (
            <>
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
                  accessibilityLabel="Nazwa pozycji do dodania"
                />
                <TouchableOpacity
                  style={[styles.addButton, adding && styles.buttonDisabled, { backgroundColor: colors.primary }]}
                  onPress={handleAddItem}
                  disabled={adding || !newItemLabel.trim()}
                  accessibilityLabel="Dodaj pozycję"
                >
                  {adding ? (
                    <ActivityIndicator size="small" color={colors.primaryText} />
                  ) : (
                    <Text style={styles.addButtonText}>Dodaj</Text>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.addRowQuantity}>
                <TextInput
                  style={[styles.inputQuantity, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                  placeholder="Ilość"
                  placeholderTextColor={colors.textSecondary}
                  value={newItemQuantity}
                  onChangeText={setNewItemQuantity}
                  keyboardType="decimal-pad"
                  editable={!adding}
                  accessibilityLabel="Ilość"
                />
                <View style={styles.unitChipsRow}>
                  {LIST_ITEM_UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[
                        styles.unitChip,
                        newItemUnit === u && styles.unitChipActive,
                        { backgroundColor: newItemUnit === u ? colors.primaryTint : colors.rowBg, borderColor: newItemUnit === u ? colors.primary : colors.border },
                      ]}
                      onPress={() => setNewItemUnit(u)}
                      accessibilityLabel={`Jednostka ${u}`}
                    >
                      <Text style={[styles.unitChipText, { color: newItemUnit === u ? colors.primary : colors.textSecondary }]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
          {todoItems.length === 0 ? (
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>Brak pozycji na liście.</Text>
          ) : listGroupBy === 'alphabet' ? (
            [...todoItems].sort((a, b) => a.label.localeCompare(b.label, 'pl')).map((item) => (
              <View key={item.id} style={[styles.listRow, { backgroundColor: colors.rowBg }]}>
                <Text style={[styles.listLabel, { color: colors.text }]}>{formatItemLine(item)}</Text>
                <TouchableOpacity
                  style={styles.markBoughtButton}
                  onPress={() => handleMarkAsBought(item.id)}
                  disabled={markingId === item.id}
                  accessibilityLabel={`Odhacz: ${item.label}`}
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
                  accessibilityLabel={`Usuń: ${item.label}`}
                >
                  {deletingId === item.id ? (
                    <ActivityIndicator size="small" color="#b91c1c" />
                  ) : (
                    <Text style={styles.deleteButtonText}>Usuń</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))
          ) : (
            (listGroupBy === 'category' ? groupListByCategory(todoItems) : groupListByRecipe(todoItems, recipeIdToName)).map((group) => (
              <View key={listGroupBy === 'category' ? (group as { categoryId: string }).categoryId : ((group as { recipeId: string | null }).recipeId ?? '_inne')} style={styles.listGroup}>
                <View style={styles.listGroupHeader}>
                  <Text style={styles.listGroupIcon}>{group.icon}</Text>
                  <Text style={[styles.listGroupTitle, { color: colors.textSecondary }]}>
                    {listGroupBy === 'category' ? (group as { categoryName: string }).categoryName : (group as { recipeName: string }).recipeName}
                  </Text>
                </View>
                {group.items.map((item) => (
                  <View key={item.id} style={[styles.listRow, { backgroundColor: colors.rowBg }]}>
                    <Text style={[styles.listLabel, { color: colors.text }]}>{formatItemLine(item)}</Text>
                    <TouchableOpacity
                      style={styles.markBoughtButton}
                      onPress={() => handleMarkAsBought(item.id)}
                      disabled={markingId === item.id}
                      accessibilityLabel={`Odhacz: ${item.label}`}
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
                      accessibilityLabel={`Usuń: ${item.label}`}
                    >
                      {deletingId === item.id ? (
                        <ActivityIndicator size="small" color="#b91c1c" />
                      ) : (
                        <Text style={styles.deleteButtonText}>Usuń</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))
          )}

          <Text style={[styles.sectionTitle, styles.sectionTitleKupione, { color: colors.success }]}>Kupione</Text>
          {boughtItems.length === 0 ? (
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>Brak odhaczonych pozycji.</Text>
          ) : listGroupBy === 'alphabet' ? (
            [...boughtItems].sort((a, b) => a.label.localeCompare(b.label, 'pl')).map((item) => (
              <View key={item.id} style={[styles.listRowBought, { backgroundColor: colors.rowBoughtBg }]}>
                <Text style={[styles.listLabelBought, { color: colors.success }]}>{formatItemLine(item)}</Text>
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
          ) : (
            (listGroupBy === 'category' ? groupListByCategory(boughtItems) : groupListByRecipe(boughtItems, recipeIdToName)).map((group) => (
              <View key={`bought-${listGroupBy === 'category' ? (group as { categoryId: string }).categoryId : ((group as { recipeId: string | null }).recipeId ?? '_inne')}`} style={styles.listGroup}>
                <View style={styles.listGroupHeader}>
                  <Text style={styles.listGroupIcon}>{group.icon}</Text>
                  <Text style={[styles.listGroupTitle, { color: colors.textSecondary }]}>
                    {listGroupBy === 'category' ? (group as { categoryName: string }).categoryName : (group as { recipeName: string }).recipeName}
                  </Text>
                </View>
                {group.items.map((item) => (
                  <View key={item.id} style={[styles.listRowBought, { backgroundColor: colors.rowBoughtBg }]}>
                    <Text style={[styles.listLabelBought, { color: colors.success }]}>{formatItemLine(item)}</Text>
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
                ))}
              </View>
            ))
          )}
        </>
      )}
      </View>

    </ScrollView>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={[styles.menuOverlay, { backgroundColor: colors.overlay, paddingTop: 56 + insets.top, paddingRight: 12, alignItems: 'flex-end' }]}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            style={[styles.menuDropdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.menuDropdownSection}>
              <Text style={[styles.menuDropdownSectionLabel, { color: colors.textSecondary }]}>Kod zaproszenia</Text>
              <View style={[styles.menuDropdownCodeRow, { backgroundColor: colors.rowBg }]}>
                <Text style={[styles.menuDropdownCode, { color: colors.text }]}>{household.invite_code}</Text>
                <TouchableOpacity
                  style={[styles.menuDropdownCopyBtn, { backgroundColor: colors.primary }]}
                  onPress={() => { handleCopyCode(); setMenuVisible(false); }}
                  accessibilityLabel="Kopiuj kod"
                >
                  <Text style={styles.menuDropdownCopyBtnText}>Kopiuj</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.menuDropdownDivider, { backgroundColor: colors.border }]} />
            <View style={styles.menuDropdownSection}>
              <Text style={[styles.menuDropdownSectionLabel, { color: colors.textSecondary }]}>Motyw</Text>
              <View style={styles.menuDropdownThemeGrid}>
                {THEME_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => { setTheme(p.id); setMenuVisible(false); }}
                    style={[styles.menuDropdownThemeBtn, themeId === p.id && styles.menuDropdownThemeBtnActive, { borderColor: colors.border, backgroundColor: themeId === p.id ? colors.primaryTint : colors.rowBg }]}
                    accessibilityLabel={`Motyw ${p.label}`}
                    accessibilityState={{ selected: themeId === p.id }}
                  >
                    <Text style={styles.menuDropdownThemeIcon}>{p.icon}</Text>
                    <Text style={[styles.menuDropdownThemeLabel, { color: themeId === p.id ? colors.primary : colors.textSecondary }]}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={[styles.menuDropdownDivider, { backgroundColor: colors.border }]} />
            <View style={styles.menuDropdownSection}>
              <TouchableOpacity
                style={[styles.menuDropdownItem, { borderBottomColor: colors.border }]}
                onPress={() => { setMenuVisible(false); navigation.navigate('Recipes'); }}
              >
                <Text style={styles.menuDropdownItemIcon}>📖</Text>
                <Text style={[styles.menuDropdownItemLabel, { color: colors.text }]}>Przepisy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuDropdownItem, { borderBottomColor: colors.border }]}
                onPress={() => { setEditNameValue(household.name); setEditNameVisible(true); setMenuVisible(false); }}
              >
                <Text style={styles.menuDropdownItemIcon}>✏️</Text>
                <Text style={[styles.menuDropdownItemLabel, { color: colors.text }]}>Edytuj nazwę gospodarstwa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuDropdownItem, styles.menuDropdownItemLast]}
                onPress={() => { setMenuVisible(false); signOut(); }}
              >
                <Text style={styles.menuDropdownItemIcon}>🚪</Text>
                <Text style={[styles.menuDropdownItemLabel, { color: colors.error }]}>Wyloguj</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
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
          <TouchableOpacity
            style={[styles.inStoreModalCard, { backgroundColor: colors.card }]}
            activeOpacity={1}
            onPress={() => {}}
          >
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
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={categoryPickerCategory !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryPickerCategory(null)}
      >
        <TouchableOpacity
          style={[styles.menuOverlay, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={() => setCategoryPickerCategory(null)}
        >
          <TouchableOpacity
            style={[styles.categoryPickerCard, { backgroundColor: colors.card }]}
            activeOpacity={1}
            onPress={() => {}}
          >
            {categoryPickerCategory && (
              <>
                <View style={styles.categoryPickerHeader}>
                  <Text style={styles.categoryPickerIcon}>{categoryPickerCategory.icon}</Text>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>{categoryPickerCategory.name}</Text>
                </View>
                <Text style={[styles.categoriesHint, { color: colors.textSecondary, marginBottom: 12 }]}>
                  Ustaw ilość i jednostkę, potem kliknij Dodaj
                </Text>
                <ScrollView
                  style={styles.categoryPickerScroll}
                  contentContainerStyle={styles.categoryPickerScrollContent}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {categoryPickerCategory.products.map((product) => {
                    const { quantity, unit, allowedUnits } = getCategoryProductForm(product);
                    return (
                      <View key={product} style={[styles.categoryProductBlock, { backgroundColor: colors.rowBg }]}>
                        <Text style={[styles.categoryProductLabel, { color: colors.text }]}>{product}</Text>
                        <View style={styles.categoryProductFormRow}>
                          <View style={styles.categoryProductQtyRow}>
                            <TouchableOpacity
                              style={[styles.categoryProductQtyBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                              onPress={() => adjustCategoryProductQty(product, -1)}
                              accessibilityLabel={`Zmniejsz ilość ${product}`}
                            >
                              <Text style={[styles.categoryProductQtyBtnText, { color: colors.text }]}>−</Text>
                            </TouchableOpacity>
                            <TextInput
                              style={[styles.categoryProductQtyInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                              value={quantity}
                              onChangeText={(t) => setCategoryProductQtyUnit(product, t, unit)}
                              keyboardType="decimal-pad"
                              placeholder="Ilość"
                              placeholderTextColor={colors.textSecondary}
                              accessibilityLabel={`Ilość dla ${product}`}
                            />
                            <TouchableOpacity
                              style={[styles.categoryProductQtyBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                              onPress={() => adjustCategoryProductQty(product, 1)}
                              accessibilityLabel={`Zwiększ ilość ${product}`}
                            >
                              <Text style={[styles.categoryProductQtyBtnText, { color: colors.text }]}>+</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.categoryProductUnitChips}>
                            {allowedUnits.map((u) => (
                              <TouchableOpacity
                                key={u}
                                style={[
                                  styles.categoryProductUnitChip,
                                  unit === u && styles.categoryProductUnitChipActive,
                                  { backgroundColor: unit === u ? colors.primaryTint : colors.background, borderColor: unit === u ? colors.primary : colors.border },
                                ]}
                                onPress={() => setCategoryProductUnit(product, u)}
                                accessibilityLabel={`Jednostka ${u}`}
                              >
                                <Text style={[styles.categoryProductUnitChipText, { color: unit === u ? colors.primary : colors.textSecondary }]}>{u}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          <TouchableOpacity
                            style={[styles.categoryProductAddBtn, { backgroundColor: colors.primary }]}
                            onPress={() => handleAddFromCategory(product)}
                            disabled={addingCategoryProduct === product}
                            accessibilityLabel={`Dodaj ${product}`}
                          >
                            {addingCategoryProduct === product ? (
                              <ActivityIndicator size="small" color={colors.primaryText} />
                            ) : (
                              <Text style={styles.categoryProductAddBtnText}>Dodaj</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity
                  style={[styles.editNameButton, styles.editNameButtonPrimary, { backgroundColor: colors.primary, marginTop: 16 }]}
                  onPress={() => setCategoryPickerCategory(null)}
                >
                  <Text style={styles.primaryButtonText}>Gotowe</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={recipeModalRecipe !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRecipeModalRecipe(null)}
      >
        <TouchableOpacity
          style={[styles.menuOverlay, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={() => setRecipeModalRecipe(null)}
        >
          <View style={[styles.recipeModalCard, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
            {recipeModalRecipe && (() => {
              const recipeServings = recipeModalRecipe.servings ?? 4;
              const hasNutrition = recipeModalRecipe.calories_per_serving != null || recipeModalRecipe.protein_per_serving_g != null || recipeModalRecipe.fat_per_serving_g != null || recipeModalRecipe.carbs_per_serving_g != null;
              const computedKcal = computeRecipeCalories(
                recipeModalRecipe.ingredients.map((i) => ({ ingredient_label: i.ingredient_label, quantity: i.quantity, unit: i.unit })),
                recipeServings
              );
              return (
              <>
                <Text style={[styles.menuTitle, { color: colors.text }]}>{recipeModalRecipe.name}</Text>
                {recipeModalRecipe.description ? (
                  <Text style={[styles.recipeDescription, { color: colors.textSecondary }]}>{recipeModalRecipe.description}</Text>
                ) : null}
                <Text style={[styles.recipeModalServingsInfo, { color: colors.textSecondary }]}>
                  Wystarczy na {recipeServings} {recipeServings === 1 ? 'porcję' : recipeServings < 5 ? 'porcje' : 'porcji'}.
                </Text>
                {(hasNutrition || computedKcal) ? (
                  <View style={[styles.recipeModalNutritionRow, { backgroundColor: colors.rowBg }]}>
                    <Text style={[styles.recipeModalNutritionLabel, { color: colors.textSecondary }]}>Na 1 porcję: </Text>
                    {recipeModalRecipe.calories_per_serving != null && <Text style={[styles.recipeModalNutritionVal, { color: colors.text }]}>{Math.round(recipeModalRecipe.calories_per_serving)} kcal</Text>}
                    {computedKcal != null && (recipeModalRecipe.calories_per_serving == null ? (
                      <Text style={[styles.recipeModalNutritionVal, { color: colors.textSecondary }]}>~{computedKcal.kcalPerServing} kcal (szac. z składników)</Text>
                    ) : (
                      <Text style={[styles.recipeModalNutritionVal, { color: colors.textSecondary }]}> (szac. {computedKcal.kcalPerServing} kcal)</Text>
                    ))}
                    {recipeModalRecipe.protein_per_serving_g != null && <Text style={[styles.recipeModalNutritionVal, { color: colors.textSecondary }]}>B: {recipeModalRecipe.protein_per_serving_g}g</Text>}
                    {recipeModalRecipe.fat_per_serving_g != null && <Text style={[styles.recipeModalNutritionVal, { color: colors.textSecondary }]}>T: {recipeModalRecipe.fat_per_serving_g}g</Text>}
                    {recipeModalRecipe.carbs_per_serving_g != null && <Text style={[styles.recipeModalNutritionVal, { color: colors.textSecondary }]}>W: {recipeModalRecipe.carbs_per_serving_g}g</Text>}
                  </View>
                ) : null}
                <View style={styles.recipeModalServingsRow}>
                  <Text style={[styles.recipeModalServingsLabel, { color: colors.text }]}>Ile porcji?</Text>
                  <View style={styles.recipeModalServingsControls}>
                    <TouchableOpacity style={[styles.recipeModalServingsBtn, { backgroundColor: colors.rowBg, borderColor: colors.border }]} onPress={() => setRecipeModalDesiredServings((s) => Math.max(1, s - 1))}>
                      <Text style={[styles.recipeModalServingsBtnText, { color: colors.text }]}>−</Text>
                    </TouchableOpacity>
                    <Text style={[styles.recipeModalServingsVal, { color: colors.text }]}>{recipeModalDesiredServings}</Text>
                    <TouchableOpacity style={[styles.recipeModalServingsBtn, { backgroundColor: colors.rowBg, borderColor: colors.border }]} onPress={() => setRecipeModalDesiredServings((s) => s + 1)}>
                      <Text style={[styles.recipeModalServingsBtnText, { color: colors.text }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>
                  Składniki {recipeModalDesiredServings !== recipeServings ? `(dla ${recipeModalDesiredServings} porcji)` : ''}
                </Text>
                {recipeModalRecipe.ingredients.map((ing) => {
                  const displayQty = scaleIngredientQuantity(ing.quantity, ing.unit, recipeModalDesiredServings, recipeServings);
                  const qtyStr = displayQty % 1 === 0 ? String(Math.round(displayQty)) : String(displayQty);
                  return (
                  <TouchableOpacity
                    key={ing.id}
                    style={[styles.recipeIngredientRow, { backgroundColor: colors.rowBg }]}
                    onPress={() => toggleRecipeIngredient(ing.id)}
                    accessibilityLabel={`${ing.ingredient_label} ${qtyStr} ${ing.unit}`}
                    accessibilityState={{ checked: recipeModalSelectedIds.has(ing.id) }}
                  >
                    <Text style={[styles.recipeIngredientLabel, { color: colors.text }]}>
                      {ing.ingredient_label} – {qtyStr} {ing.unit}
                    </Text>
                    <Text style={{ color: colors.primary, fontSize: 18 }}>
                      {recipeModalSelectedIds.has(ing.id) ? '☑' : '☐'}
                    </Text>
                  </TouchableOpacity>
                  );
                })}
                {recipeModalRecipe.steps && recipeModalRecipe.steps.length > 0 ? (
                  <>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Sposób przygotowania</Text>
                    {recipeModalRecipe.steps.map((step, idx) => (
                      <View key={step.id} style={[styles.recipeStepRow, { backgroundColor: colors.rowBg }]}>
                        <Text style={[styles.recipeStepNum, { color: colors.primary }]}>{idx + 1}.</Text>
                        <Text style={[styles.recipeStepText, { color: colors.text }]}>{step.instruction}</Text>
                      </View>
                    ))}
                  </>
                ) : null}
                <View style={styles.editNameRow}>
                  <TouchableOpacity
                    style={[styles.editNameButton, styles.editNameButtonSecondary, { borderColor: colors.primary }]}
                    onPress={() => setRecipeModalRecipe(null)}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Anuluj</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.editNameButton, styles.editNameButtonPrimary, { backgroundColor: colors.primary }, (addingRecipeIngredients || recipeModalSelectedIds.size === 0) && styles.buttonDisabled]}
                    onPress={handleAddRecipeIngredientsToList}
                    disabled={addingRecipeIngredients || recipeModalSelectedIds.size === 0}
                  >
                    {addingRecipeIngredients ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Dodaj wybrane do listy</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
              );
            })()}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: {
    flex: 1,
    minHeight: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    flexGrow: 1,
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
  },
  menuDropdownCard: {
    width: 280,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuDropdownSection: {
    paddingVertical: 6,
  },
  menuDropdownSectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  menuDropdownCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 8,
  },
  menuDropdownCode: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  menuDropdownCopyBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  menuDropdownCopyBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  menuDropdownDivider: {
    height: 1,
    marginVertical: 4,
  },
  menuDropdownThemeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  menuDropdownThemeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 62,
  },
  menuDropdownThemeBtnActive: {
    borderWidth: 2,
  },
  menuDropdownThemeIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  menuDropdownThemeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  menuDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    gap: 10,
  },
  menuDropdownItemIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  menuDropdownItemLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuDropdownItemLast: {
    borderBottomWidth: 0,
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
  themePresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  themePresetButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 68,
  },
  themePresetButtonActive: {
    borderWidth: 2,
  },
  themePresetLabel: {
    fontSize: 11,
    marginTop: 2,
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
  categoriesCollapseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  categoriesCollapseLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesCollapseChevron: {
    fontSize: 12,
  },
  categoriesSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  categoriesHint: {
    fontSize: 13,
    marginBottom: 12,
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestedRecipesSection: {
    marginBottom: 20,
  },
  drawRecipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 12,
  },
  drawRecipeButtonIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  drawRecipeButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  listSortDivider: {
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 16,
    marginBottom: 8,
  },
  listSortLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  suggestedRecipesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  recipeChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: '48%',
  },
  recipeChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recipeChipKcal: {
    fontSize: 11,
    marginTop: 2,
  },
  recipeModalCard: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    maxHeight: '80%',
  },
  recipeDescription: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  recipeModalServingsInfo: {
    fontSize: 13,
    marginTop: 6,
  },
  recipeModalNutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  recipeModalNutritionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  recipeModalNutritionVal: {
    fontSize: 13,
  },
  recipeModalServingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  recipeModalServingsLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  recipeModalServingsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recipeModalServingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeModalServingsBtnText: {
    fontSize: 18,
    fontWeight: '700',
  },
  recipeModalServingsVal: {
    fontSize: 17,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  recipeIngredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  recipeIngredientLabel: {
    fontSize: 15,
    flex: 1,
  },
  recipeStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  recipeStepNum: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
    minWidth: 20,
  },
  recipeStepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  categoryChip: {
    width: '30%',
    minWidth: 100,
    maxWidth: 160,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  categoryChipLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryPickerCard: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    maxHeight: Dimensions.get('window').height * 0.85,
    alignSelf: 'center',
  },
  categoryPickerScroll: {
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  categoryPickerScrollContent: {
    paddingBottom: 8,
  },
  categoryPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  categoryPickerIcon: {
    fontSize: 36,
  },
  categoryProductBlock: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  categoryProductLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  categoryProductFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryProductQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryProductQtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryProductQtyBtnText: {
    fontSize: 18,
    fontWeight: '700',
  },
  categoryProductQtyInput: {
    width: 52,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    textAlign: 'center',
  },
  categoryProductUnitChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
  },
  categoryProductUnitChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryProductUnitChipActive: {
    borderWidth: 2,
  },
  categoryProductUnitChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryProductAddBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: 64,
    alignItems: 'center',
  },
  categoryProductAddBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryProductAdd: {
    fontSize: 15,
    fontWeight: '600',
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
    marginBottom: 8,
  },
  addRowQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  inputQuantity: {
    width: 72,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  unitChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  unitChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  unitChipActive: {
    borderWidth: 2,
  },
  unitChipText: {
    fontSize: 13,
    fontWeight: '600',
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
  listGroupByRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  listGroupByButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  listGroupByButtonActive: {
    borderWidth: 2,
  },
  listGroupByLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  listGroup: {
    marginBottom: 14,
  },
  listGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  listGroupIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  listGroupTitle: {
    fontSize: 13,
    fontWeight: '600',
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
