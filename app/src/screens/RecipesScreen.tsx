import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  SectionList,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useRecipes } from '../hooks/useRecipes';
import { useHouseholdFavoriteRecipes } from '../hooks/useHouseholdFavoriteRecipes';
import { useHousehold } from '../hooks/useHousehold';
import { useTheme } from '../contexts/ThemeContext';
import { SCREEN_CONTENT_MAX_WIDTH, SCREEN_PADDING_HORIZONTAL } from '../config/constants';
import type { MainStackParamList } from '../navigation/types';
import type { RecipeWithIngredients } from '../types/recipe';
import type { MealType } from '../types/recipe';
import { recipeHasMeat } from '../lib/recipeMeat';

type Nav = NativeStackNavigationProp<MainStackParamList, 'Recipes'>;

export default function RecipesScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { household } = useHousehold(user ?? null);
  const { recipes, isLoading, error } = useRecipes();
  const { favoriteRecipeIds, toggleFavorite } = useHouseholdFavoriteRecipes(household?.id ?? null);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [mealFilter, setMealFilter] = useState<MealType | 'all'>('all');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'themealdb' | 'wikikuchnia'>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'en' | 'pl'>('all');
  const [meatFilter, setMeatFilter] = useState<'all' | 'meat' | 'meatless'>('all');
  const [sortBy, setSortBy] = useState<'alphabet' | 'meal'>('alphabet');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [sortPanelOpen, setSortPanelOpen] = useState(false);

  const categoryLabel =
    mealFilter === 'all'
      ? 'Wszystkie kategorie'
      : mealFilter === 'breakfast'
        ? 'Śniadanie'
        : mealFilter === 'lunch'
          ? 'Obiad'
          : 'Podwieczorek';
  const categoryOptions: { value: MealType | 'all'; label: string }[] = [
    { value: 'all', label: 'Wszystkie kategorie' },
    { value: 'breakfast', label: 'Śniadanie' },
    { value: 'lunch', label: 'Obiad' },
    { value: 'afternoon_snack', label: 'Podwieczorek' },
  ];

  const filteredRecipes = useMemo(() => {
    let list = recipes;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.ingredient_label.toLowerCase().includes(q))
      );
    }
    if (onlyFavorites) {
      list = list.filter((r) => favoriteRecipeIds.has(r.id));
    }
    if (mealFilter !== 'all') {
      list = list.filter((r) => r.meal_type === mealFilter);
    }
    if (sourceFilter !== 'all') {
      list = list.filter((r) => r.source === sourceFilter);
    }
    if (languageFilter !== 'all') {
      list = list.filter((r) => r.language === languageFilter);
    }
    if (meatFilter === 'meat') {
      list = list.filter((r) => recipeHasMeat(r));
    } else if (meatFilter === 'meatless') {
      list = list.filter((r) => !recipeHasMeat(r));
    }
    const mealOrder = (m: MealType | null) => (m === 'breakfast' ? 0 : m === 'lunch' ? 1 : m === 'afternoon_snack' ? 2 : 3);
    if (sortBy === 'alphabet') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
    } else {
      list = [...list].sort((a, b) => mealOrder(a.meal_type) - mealOrder(b.meal_type) || a.name.localeCompare(b.name, 'pl'));
    }
    return list;
  }, [recipes, searchQuery, onlyFavorites, favoriteRecipeIds, mealFilter, sourceFilter, languageFilter, meatFilter, sortBy]);

  type RecipeSection = { title: string; data: RecipeWithIngredients[] };
  const recipeSections = useMemo((): RecipeSection[] => {
    if (filteredRecipes.length === 0) return [];
    if (sortBy === 'alphabet') {
      const byLetter = new Map<string, RecipeWithIngredients[]>();
      for (const r of filteredRecipes) {
        const char = r.name.trim().charAt(0);
        const letter = char.toUpperCase() || '#';
        const key = /[\p{L}\p{N}]/u.test(letter) ? letter : '#';
        const list = byLetter.get(key) ?? [];
        list.push(r);
        byLetter.set(key, list);
      }
      return [...byLetter.entries()]
        .sort((a, b) => (a[0] === '#' ? 1 : b[0] === '#' ? -1 : a[0].localeCompare(b[0], 'pl')))
        .map(([title, data]) => ({ title, data }));
    }
    const mealOrder: (MealType | null)[] = ['breakfast', 'lunch', 'afternoon_snack', null];
    const mealLabels: Record<string, string> = {
      breakfast: 'Śniadanie',
      lunch: 'Obiad',
      afternoon_snack: 'Podwieczorek',
    };
    const byMeal = new Map<string, RecipeWithIngredients[]>();
    for (const r of filteredRecipes) {
      const key = r.meal_type ?? 'other';
      const label = key === 'other' ? 'Inne' : mealLabels[key];
      const list = byMeal.get(label) ?? [];
      list.push(r);
      byMeal.set(label, list);
    }
    return mealOrder
      .map((m) => {
        const label = m === null ? 'Inne' : mealLabels[m];
        const data = byMeal.get(label);
        return data?.length ? { title: label, data } : null;
      })
      .filter((s): s is RecipeSection => s != null);
  }, [filteredRecipes, sortBy]);

  const openRecipe = (recipe: RecipeWithIngredients) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <View style={styles.contentWrap}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentWrap}>
        {/* Filtry i Sortowanie obok siebie, zwinięte – klik otwiera */}
        <View style={[styles.collapseRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[styles.collapseButton, filterPanelOpen && styles.collapseButtonActive, { borderRightWidth: 1, borderRightColor: colors.border, backgroundColor: filterPanelOpen ? colors.primaryTint : 'transparent' }]}
            onPress={() => setFilterPanelOpen((v) => !v)}
            accessibilityLabel={filterPanelOpen ? 'Zwiń filtry' : 'Rozwiń filtry'}
            accessibilityState={{ expanded: filterPanelOpen }}
          >
            <Text style={[styles.collapseButtonText, { color: filterPanelOpen ? colors.primary : colors.text }]}>Filtry</Text>
            <Text style={[styles.collapseChevron, { color: filterPanelOpen ? colors.primary : colors.textSecondary }]}>{filterPanelOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.collapseButton, sortPanelOpen && styles.collapseButtonActive, { backgroundColor: sortPanelOpen ? colors.primaryTint : 'transparent' }]}
            onPress={() => setSortPanelOpen((v) => !v)}
            accessibilityLabel={sortPanelOpen ? 'Zwiń sortowanie' : 'Rozwiń sortowanie'}
            accessibilityState={{ expanded: sortPanelOpen }}
          >
            <Text style={[styles.collapseButtonText, { color: sortPanelOpen ? colors.primary : colors.text }]}>Sortowanie</Text>
            <Text style={[styles.collapseChevron, { color: sortPanelOpen ? colors.primary : colors.textSecondary }]}>{sortPanelOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>

        {filterPanelOpen && (
          <View style={[styles.filterBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Składniki</Text>
            <View style={[styles.searchRow, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Szukaj po nazwie lub składniku…"
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                accessibilityLabel="Filtruj po składnikach"
              />
            </View>
            <TouchableOpacity
              style={[styles.favoritesFilter, { backgroundColor: onlyFavorites ? colors.primaryTint : colors.rowBg, borderColor: colors.border }]}
              onPress={() => setOnlyFavorites((v) => !v)}
              accessibilityLabel={onlyFavorites ? 'Pokaż wszystkie przepisy' : 'Tylko ulubione'}
              accessibilityState={{ selected: onlyFavorites }}
            >
              <Text style={styles.favFilterIcon}>{onlyFavorites ? '❤️' : '🤍'}</Text>
              <Text style={[styles.favFilterLabel, { color: onlyFavorites ? colors.primary : colors.textSecondary }]}>Tylko ulubione</Text>
            </TouchableOpacity>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Kategoria</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => setCategoryDropdownOpen(true)}
              accessibilityLabel={`Kategoria: ${categoryLabel}. Kliknij, aby zmienić`}
            >
              <Text style={[styles.dropdownButtonText, { color: colors.text }]}>{categoryLabel}</Text>
              <Text style={[styles.dropdownChevron, { color: colors.textSecondary }]}>▼</Text>
            </TouchableOpacity>
            <Modal
              visible={categoryDropdownOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setCategoryDropdownOpen(false)}
            >
              <Pressable style={styles.dropdownBackdrop} onPress={() => setCategoryDropdownOpen(false)}>
                <View style={[styles.dropdownPanel, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.dropdownTitle, { color: colors.textSecondary }]}>Wybierz kategorię</Text>
                  {categoryOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.dropdownOption, mealFilter === opt.value && { backgroundColor: colors.primaryTint }]}
                      onPress={() => {
                        setMealFilter(opt.value);
                        setCategoryDropdownOpen(false);
                      }}
                      accessibilityLabel={opt.label}
                      accessibilityState={{ selected: mealFilter === opt.value }}
                    >
                      <Text style={[styles.dropdownOptionText, { color: mealFilter === opt.value ? colors.primary : colors.text }]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Pressable>
            </Modal>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Źródło</Text>
            <View style={styles.chipsRow}>
              {(['all', 'themealdb', 'wikikuchnia'] as const).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.filterChip, sourceFilter === key && styles.filterChipActive, { borderColor: colors.border, backgroundColor: sourceFilter === key ? colors.primaryTint : colors.rowBg }]}
                  onPress={() => setSourceFilter(key)}
                  accessibilityLabel={key === 'all' ? 'Wszystkie źródła' : key === 'themealdb' ? 'TheMealDB' : 'WikiKuchnia'}
                  accessibilityState={{ selected: sourceFilter === key }}
                >
                  <Text style={[styles.filterChipText, { color: sourceFilter === key ? colors.primary : colors.textSecondary }]}>
                    {key === 'all' ? 'Wszystkie' : key === 'themealdb' ? 'TheMealDB' : 'WikiKuchnia'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Język</Text>
            <View style={styles.chipsRow}>
              {(['all', 'pl', 'en'] as const).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.filterChip, languageFilter === key && styles.filterChipActive, { borderColor: colors.border, backgroundColor: languageFilter === key ? colors.primaryTint : colors.rowBg }]}
                  onPress={() => setLanguageFilter(key)}
                  accessibilityLabel={key === 'all' ? 'Wszystkie języki' : key === 'pl' ? 'Polski' : 'Angielski'}
                  accessibilityState={{ selected: languageFilter === key }}
                >
                  <Text style={[styles.filterChipText, { color: languageFilter === key ? colors.primary : colors.textSecondary }]}>
                    {key === 'all' ? 'Wszystkie' : key === 'pl' ? 'Polski' : 'Angielski'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Mięso / wege</Text>
            <View style={styles.chipsRow}>
              {(['all', 'meat', 'meatless'] as const).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.filterChip, meatFilter === key && styles.filterChipActive, { borderColor: colors.border, backgroundColor: meatFilter === key ? colors.primaryTint : colors.rowBg }]}
                  onPress={() => setMeatFilter(key)}
                  accessibilityLabel={key === 'all' ? 'Wszystkie' : key === 'meat' ? 'Tylko mięsne' : 'Tylko bezmięsne'}
                  accessibilityState={{ selected: meatFilter === key }}
                >
                  <Text style={[styles.filterChipText, { color: meatFilter === key ? colors.primary : colors.textSecondary }]}>
                    {key === 'all' ? 'Wszystkie' : key === 'meat' ? 'Mięsne' : 'Bezmięsne'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {sortPanelOpen && (
          <View style={[styles.sortBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={[styles.filterChip, sortBy === 'alphabet' && styles.filterChipActive, { borderColor: colors.border, backgroundColor: sortBy === 'alphabet' ? colors.primaryTint : colors.rowBg }]}
                onPress={() => setSortBy('alphabet')}
                accessibilityLabel="Sortuj alfabetycznie"
                accessibilityState={{ selected: sortBy === 'alphabet' }}
              >
                <Text style={[styles.filterChipText, { color: sortBy === 'alphabet' ? colors.primary : colors.textSecondary }]}>Alfabetycznie</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, sortBy === 'meal' && styles.filterChipActive, { borderColor: colors.border, backgroundColor: sortBy === 'meal' ? colors.primaryTint : colors.rowBg }]}
                onPress={() => setSortBy('meal')}
                accessibilityLabel="Sortuj po kategoriach"
                accessibilityState={{ selected: sortBy === 'meal' }}
              >
                <Text style={[styles.filterChipText, { color: sortBy === 'meal' ? colors.primary : colors.textSecondary }]}>Po kategoriach</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.hint, { color: colors.textSecondary }]}>Ładowanie przepisów…</Text>
          </View>
        ) : (
          <SectionList
            style={styles.listFill}
            sections={recipeSections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
            ListEmptyComponent={
              <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                {onlyFavorites ? 'Brak ulubionych przepisów.' : 'Brak przepisów pasujących do filtrów.'}
              </Text>
            }
            renderSectionHeader={({ section: { title } }) => (
              <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
                <Text style={[styles.sectionHeaderText, { color: colors.primary }]}>{title}</Text>
              </View>
            )}
            stickySectionHeadersEnabled={false}
            renderItem={({ item }) => {
              const isFav = favoriteRecipeIds.has(item.id);
              return (
                <TouchableOpacity
                  style={[styles.recipeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => openRecipe(item)}
                  activeOpacity={0.7}
                  accessibilityLabel={`Przepis: ${item.name}`}
                >
                  <View style={styles.recipeCardMain}>
                    <Text style={[styles.recipeName, { color: colors.text }]} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {item.description ? (
                      <Text style={[styles.recipeDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}
                    <Text style={[styles.recipeMeta, { color: colors.textSecondary }]}>
                      {item.ingredients.length} składników
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.favButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    accessibilityLabel={isFav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                    accessibilityState={{ selected: isFav }}
                  >
                    <Text style={styles.favIcon}>{isFav ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrap: {
    width: '100%',
    maxWidth: SCREEN_CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    flex: 1,
    paddingHorizontal: SCREEN_PADDING_HORIZONTAL,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  favoritesFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  favFilterIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  favFilterLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  recipeCardMain: {
    flex: 1,
  },
  recipeName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  recipeDesc: {
    fontSize: 14,
    marginBottom: 4,
  },
  recipeMeta: {
    fontSize: 13,
  },
  favButton: {
    padding: 8,
    marginLeft: 8,
  },
  favIcon: {
    fontSize: 24,
  },
  collapseRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    overflow: 'hidden',
  },
  collapseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 6,
  },
  collapseButtonActive: {},
  collapseButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  collapseChevron: {
    fontSize: 11,
  },
  filterBlock: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  filterBlockTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sortBlock: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  listFill: {
    flex: 1,
    minHeight: 200,
  },
  listContent: {
    flexGrow: 1,
  },
  filterSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 6,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 4,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownChevron: {
    fontSize: 12,
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dropdownPanel: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  dropdownTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  dropdownOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryHeading: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionHeader: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginTop: 12,
    marginBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterChipActive: {
    borderWidth: 2,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyHint: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
  hint: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
  },
});
