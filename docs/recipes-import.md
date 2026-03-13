# Import przepisów do bazy

Przepisy można wgrać do bazy z pliku JSON: **składniki** (do dodawania na listę jak dotąd) oraz **kroki** (sposób przygotowania).

## 1. Migracje (jednorazowo)

Upewnij się, że są zastosowane migracje:

- `supabase/migrations/20260314100000_recipe_steps.sql` (kroki)
- `supabase/migrations/20260315100000_recipe_servings_nutrition.sql` (porcje i wartości odżywcze)

(np. `supabase db push` lub uruchomienie plików w Supabase → SQL Editor).

## 2. Format JSON (szablon)

Plik musi zawierać tablicę `recipes`. Każdy przepis:

| Pole                    | Wymagane | Opis                                      |
|-------------------------|----------|-------------------------------------------|
| `name`                  | tak      | Nazwa przepisu                            |
| `description`           | nie      | Krótki opis                               |
| `servings`              | nie      | Na ile porcji (domyślnie 4)               |
| `calories_per_serving`  | nie      | kcal na 1 porcję                          |
| `protein_per_serving_g` | nie      | Białko (g) na 1 porcję                     |
| `fat_per_serving_g`     | nie      | Tłuszcz (g) na 1 porcję                   |
| `carbs_per_serving_g`   | nie      | Węglowodany (g) na 1 porcję               |
| `ingredients`           | tak      | Tablica składników (do „Dodaj do listy”) |
| `steps`                 | nie      | Tablica kroków (tekst każdego kroku)      |

Składnik: `label` (nazwa), `quantity` (liczba), `unit` – jedna z: **szt**, **kg**, **g**, **l**, **ml**, **opak**.

Przykład (pełny szablon: `docs/recipes-import-template.json`):

```json
{
  "recipes": [
    {
      "name": "Zupa pomidorowa",
      "description": "Prosta zupa pomidorowa z makaronem.",
      "ingredients": [
        { "label": "Pomidory", "quantity": 4, "unit": "szt" },
        { "label": "Makaron", "quantity": 200, "unit": "g" }
      ],
      "steps": [
        "Pomidory sparzyć, obrać i pokroić.",
        "W garnku rozgrzać olej, dodać pomidory, dusić.",
        "Dolać wodę, gotować 15 min. Dodać makaron."
      ]
    }
  ]
}
```

## 3. Generowanie SQL i wgranie

W katalogu głównym projektu:

```bash
node scripts/recipes-json-to-sql.js docs/recipes-import-template.json > moje-przepisy.sql
```

(albo podaj inny plik JSON).

Następnie w Supabase: **SQL Editor** → wklej zawartość `moje-przepisy.sql` → **Run**. Nowe przepisy pojawią się w aplikacji (lista Przepisy + sugestie na Home).

## 4. Edycja szablonu

- Skopiuj `docs/recipes-import-template.json` (np. jako `moje-przepisy.json`).
- Uzupełnij kolejne przepisy w tablicy `recipes` (name, ingredients, opcjonalnie description i steps).
- Uruchom: `node scripts/recipes-json-to-sql.js moje-przepisy.json > moje-przepisy.sql` i wgraj wygenerowany SQL w Supabase.

Kroki są wyświetlane w aplikacji w widoku przepisu („Sposób przygotowania”) oraz w modalu sugestii na stronie głównej.
