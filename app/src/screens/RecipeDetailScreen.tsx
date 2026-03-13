import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../hooks/useHousehold';
import { useListItems } from '../hooks/useListItems';
import { useInStoreSession } from '../hooks/useInStoreSession';
import { useHouseholdFavoriteRecipes } from '../hooks/useHouseholdFavoriteRecipes';
import { useTheme } from '../contexts/ThemeContext';
import { SCREEN_CONTENT_MAX_WIDTH, SCREEN_PADDING_HORIZONTAL } from '../config/constants';
import { scaleIngredientQuantity } from '../lib/recipeServings';
import { computeRecipeCalories } from '../data/ingredientCalories';
import type { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'RecipeDetail'>;

export default function RecipeDetailScreen() {
  const { params } = useRoute<Props['route']>();
  const navigation = useNavigation<Props['navigation']>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { household } = useHousehold(user ?? null);
  const { addItem } = useListItems(household?.id ?? null);
  const { activeSession } = useInStoreSession(household?.id ?? null, user?.id ?? null);
  const { favoriteRecipeIds, toggleFavorite } = useHouseholdFavoriteRecipes(household?.id ?? null);

  const recipe = params.recipe;
  const isAddBlocked = !!activeSession;
  const recipeServings = recipe.servings ?? 4;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(recipe.ingredients.map((i) => i.id)));
  const [adding, setAdding] = useState(false);
  const [desiredServings, setDesiredServings] = useState(recipeServings);

  const hasNutrition =
    recipe.calories_per_serving != null ||
    recipe.protein_per_serving_g != null ||
    recipe.fat_per_serving_g != null ||
    recipe.carbs_per_serving_g != null;
  const computedKcal = computeRecipeCalories(
    recipe.ingredients.map((i) => ({ ingredient_label: i.ingredient_label, quantity: i.quantity, unit: i.unit })),
    recipeServings
  );

  const toggleIngredient = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddToList = async () => {
    if (isAddBlocked) {
      Alert.alert('Zakupy w toku', 'Nie możesz teraz dopisywać do listy.');
      return;
    }
    const toAdd = recipe.ingredients.filter((ing) => selectedIds.has(ing.id));
    if (toAdd.length === 0) return;
    const scale = desiredServings / recipeServings;
    setAdding(true);
    for (const ing of toAdd) {
      const qty = scaleIngredientQuantity(ing.quantity, ing.unit, desiredServings, recipeServings);
      await addItem(ing.ingredient_label, qty, ing.unit, recipe.id);
    }
    setAdding(false);
    navigation.goBack();
  };

  const isFav = favoriteRecipeIds.has(recipe.id);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentWrap}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>{recipe.name}</Text>
          {recipe.description ? (
            <Text style={[styles.description, { color: colors.textSecondary }]}>{recipe.description}</Text>
          ) : null}
          <Text style={[styles.servingsInfo, { color: colors.textSecondary }]}>
            Wystarczy na {recipeServings} {recipeServings === 1 ? 'porcję' : recipeServings < 5 ? 'porcje' : 'porcji'}.
          </Text>
          {(hasNutrition || computedKcal) ? (
            <View style={[styles.nutritionRow, { backgroundColor: colors.rowBg }]}>
              <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Na 1 porcję:</Text>
              <View style={styles.nutritionValues}>
                {recipe.calories_per_serving != null && (
                  <Text style={[styles.nutritionValue, { color: colors.text }]}>{Math.round(recipe.calories_per_serving)} kcal</Text>
                )}
                {computedKcal != null && (recipe.calories_per_serving == null ? (
                  <Text style={[styles.nutritionValue, { color: colors.textSecondary }]}>~{computedKcal.kcalPerServing} kcal (szac. z składników)</Text>
                ) : (
                  <Text style={[styles.nutritionValue, { color: colors.textSecondary }]}> (szac. {computedKcal.kcalPerServing} kcal)</Text>
                ))}
                {recipe.protein_per_serving_g != null && (
                  <Text style={[styles.nutritionValue, { color: colors.textSecondary }]}>B: {recipe.protein_per_serving_g}g</Text>
                )}
                {recipe.fat_per_serving_g != null && (
                  <Text style={[styles.nutritionValue, { color: colors.textSecondary }]}>T: {recipe.fat_per_serving_g}g</Text>
                )}
                {recipe.carbs_per_serving_g != null && (
                  <Text style={[styles.nutritionValue, { color: colors.textSecondary }]}>W: {recipe.carbs_per_serving_g}g</Text>
                )}
              </View>
            </View>
          ) : null}
          <View style={styles.servingsPickerRow}>
            <Text style={[styles.servingsPickerLabel, { color: colors.text }]}>Ile porcji chcesz zrobić?</Text>
            <View style={styles.servingsPickerControls}>
              <TouchableOpacity
                style={[styles.servingsBtn, { backgroundColor: colors.rowBg, borderColor: colors.border }]}
                onPress={() => setDesiredServings((s) => Math.max(1, s - 1))}
                accessibilityLabel="Zmniejsz liczbę porcji"
              >
                <Text style={[styles.servingsBtnText, { color: colors.text }]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.servingsValue, { color: colors.text }]}>{desiredServings}</Text>
              <TouchableOpacity
                style={[styles.servingsBtn, { backgroundColor: colors.rowBg, borderColor: colors.border }]}
                onPress={() => setDesiredServings((s) => s + 1)}
                accessibilityLabel="Zwiększ liczbę porcji"
              >
                <Text style={[styles.servingsBtnText, { color: colors.text }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.favRow}
            onPress={() => toggleFavorite(recipe.id)}
            accessibilityLabel={isFav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
            accessibilityState={{ selected: isFav }}
          >
            <Text style={styles.favIcon}>{isFav ? '❤️' : '🤍'}</Text>
            <Text style={[styles.favLabel, { color: colors.textSecondary }]}>
              {isFav ? 'W ulubionych' : 'Dodaj do ulubionych'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Składniki {desiredServings !== recipeServings ? `(dla ${desiredServings} porcji)` : ''}
        </Text>
        {recipe.ingredients.map((ing) => {
          const displayQty = scaleIngredientQuantity(ing.quantity, ing.unit, desiredServings, recipeServings);
          const qtyStr = displayQty % 1 === 0 ? String(Math.round(displayQty)) : String(displayQty);
          return (
          <TouchableOpacity
            key={ing.id}
            style={[styles.ingredientRow, { backgroundColor: colors.rowBg }]}
            onPress={() => toggleIngredient(ing.id)}
            accessibilityLabel={`${ing.ingredient_label} ${qtyStr} ${ing.unit}`}
            accessibilityState={{ checked: selectedIds.has(ing.id) }}
          >
            <Text style={[styles.ingredientLabel, { color: colors.text }]}>
              {ing.ingredient_label} – {qtyStr} {ing.unit}
            </Text>
            <Text style={{ color: colors.primary, fontSize: 18 }}>
              {selectedIds.has(ing.id) ? '☑' : '☐'}
            </Text>
          </TouchableOpacity>
          );
        })}

        {recipe.steps && recipe.steps.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Sposób przygotowania</Text>
            {recipe.steps.map((step, index) => (
              <View key={step.id} style={[styles.stepRow, { backgroundColor: colors.rowBg }]}>
                <Text style={[styles.stepNumber, { color: colors.primary }]}>{index + 1}.</Text>
                <Text style={[styles.stepInstruction, { color: colors.text }]}>{step.instruction}</Text>
              </View>
            ))}
          </>
        ) : null}

        {isAddBlocked ? (
          <View style={[styles.blockedBanner, { backgroundColor: colors.rowBg }]}>
            <Text style={[styles.blockedText, { color: colors.error }]}>
              Zakupy w toku. Nie możesz teraz dopisywać do listy.
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: colors.primary },
              (adding || selectedIds.size === 0) && styles.addButtonDisabled,
            ]}
            onPress={handleAddToList}
            disabled={adding || selectedIds.size === 0}
          >
            {adding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>Dodaj wybrane do listy</Text>
            )}
          </TouchableOpacity>
        )}
        </ScrollView>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  headerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  servingsInfo: {
    fontSize: 14,
    marginBottom: 10,
  },
  nutritionRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  nutritionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  nutritionValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionValue: {
    fontSize: 14,
  },
  servingsPickerRow: {
    marginBottom: 12,
  },
  servingsPickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  servingsPickerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  servingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsBtnText: {
    fontSize: 20,
    fontWeight: '700',
  },
  servingsValue: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'center',
  },
  favRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  favIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  favLabel: {
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 10,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 6,
  },
  ingredientLabel: {
    fontSize: 16,
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 6,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10,
    minWidth: 24,
  },
  stepInstruction: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  blockedBanner: {
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  blockedText: {
    fontSize: 15,
    textAlign: 'center',
  },
  addButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
