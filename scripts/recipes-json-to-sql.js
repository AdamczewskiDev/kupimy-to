#!/usr/bin/env node
/**
 * Generuje SQL do wgrania przepisów z pliku JSON.
 * Użycie: node scripts/recipes-json-to-sql.js docs/recipes-import-template.json
 * Wynik wklej do Supabase → SQL Editor i uruchom.
 *
 * Format JSON: { "recipes": [ { "name", "description?", "ingredients": [ { "label", "quantity", "unit" } ], "steps": [ "tekst kroku" ] } ] }
 * Jednostki: szt, kg, g, l, ml, opak
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UNITS = new Set(['szt', 'kg', 'g', 'l', 'ml', 'opak']);

function escapeSql(s) {
  if (s == null) return 'NULL';
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function parseNumber(v, def = 1) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

const file = process.argv[2];
if (!file) {
  console.error('Użycie: node scripts/recipes-json-to-sql.js <ścieżka-do-pliku.json>');
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
} catch (e) {
  console.error('Błąd odczytu pliku:', e.message);
  process.exit(1);
}

const recipes = data.recipes;
if (!Array.isArray(recipes) || recipes.length === 0) {
  console.error('Brak tablicy "recipes" lub jest pusta.');
  process.exit(1);
}

const out = [];
out.push('-- Wygenerowane z ' + path.basename(file) + '. Uruchom w Supabase SQL Editor.');
out.push('');

for (const r of recipes) {
  const name = r.name && String(r.name).trim();
  if (!name) {
    console.warn('Pomijam przepis bez nazwy.');
    continue;
  }
  const recipeId = crypto.randomUUID();
  const description = r.description != null ? String(r.description).trim() : null;
  const servings = parseNumber(r.servings, 4);
  const calories = r.calories_per_serving != null && Number.isFinite(Number(r.calories_per_serving)) ? Number(r.calories_per_serving) : null;
  const protein = r.protein_per_serving_g != null && Number.isFinite(Number(r.protein_per_serving_g)) ? Number(r.protein_per_serving_g) : null;
  const fat = r.fat_per_serving_g != null && Number.isFinite(Number(r.fat_per_serving_g)) ? Number(r.fat_per_serving_g) : null;
  const carbs = r.carbs_per_serving_g != null && Number.isFinite(Number(r.carbs_per_serving_g)) ? Number(r.carbs_per_serving_g) : null;
  const sqlNull = (v) => (v == null ? 'NULL' : String(v));
  out.push(
    'INSERT INTO recipes (id, name, description, servings, calories_per_serving, protein_per_serving_g, fat_per_serving_g, carbs_per_serving_g) VALUES (' +
      [recipeId, name, description].map(escapeSql).join(', ') +
      ', ' + servings + ', ' + sqlNull(calories) + ', ' + sqlNull(protein) + ', ' + sqlNull(fat) + ', ' + sqlNull(carbs) +
      ');'
  );

  const ingredients = Array.isArray(r.ingredients) ? r.ingredients : [];
  for (let i = 0; i < ingredients.length; i++) {
    const ing = ingredients[i];
    const label = (ing.label && String(ing.label).trim()) || '?';
    const quantity = parseNumber(ing.quantity, 1);
    const unit = UNITS.has(ing.unit) ? ing.unit : 'szt';
    out.push(
      "INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('" +
        recipeId +
        "', " +
        escapeSql(label) +
        ', ' +
        quantity +
        ", " +
        escapeSql(unit) +
        ', ' +
        (i + 1) +
        ');'
    );
  }

  const steps = Array.isArray(r.steps) ? r.steps : [];
  for (let i = 0; i < steps.length; i++) {
    const instruction = String(steps[i]).trim() || '—';
    out.push(
      "INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('" +
        recipeId +
        "', " +
        (i + 1) +
        ', ' +
        escapeSql(instruction) +
        ');'
    );
  }

  out.push('');
}

console.log(out.join('\n'));
