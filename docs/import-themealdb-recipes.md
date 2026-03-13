# Import przepisów z TheMealDB do aplikacji

[TheMealDB](https://www.themealdb.com/) to **darmowa, otwarta baza przepisów** z API. Zgodnie z ich [regulaminem](https://www.themealdb.com/terms_of_use.php) możesz kopiować i modyfikować treści zwracane przez API (używając oficjalnych endpointów).

## Krok 1: Wygeneruj plik SQL

W katalogu głównym projektu uruchom:

```bash
node scripts/fetch-themealdb.js
```

Skrypt:
- pobiera wszystkie kategorie i przepisy z TheMealDB (ok. 598),
- mapuje kategorie na Twoje typy posiłków: **Breakfast → śniadanie**, **Dessert → podwieczorek**, reszta → **obiad**,
- zapisuje plik `supabase/seed-en/seed-themealdb.sql`.

**Szybki test (np. tylko 50 przepisów):**

```bash
node scripts/fetch-themealdb.js 50
```

Pobieranie pełnej listy może zająć ok. 3–5 minut (limit zapytań do API).

## Krok 1b: Tłumaczenie na polski (opcjonalnie)

Aby mieć nazwy przepisów, opisy, składniki i kroki po polsku:

1. Zainstaluj zależność w katalogu głównym projektu:  
   `npm install`
2. Uruchom:  
   `npm run seed:translate`  
   (albo `node scripts/translate-seed-to-polish.js`)

Skrypt tworzy plik **`supabase/seed-pl/seed-themealdb-pl.sql`** (tłumaczenie przez Google Translate). Tłumaczenie ~600 przepisów może zająć ok. 15–30 minut (batch z opóźnieniami). Test na małej próbce:  
`node scripts/translate-seed-to-polish.js 20`

Potem dzielisz plik **polski**:  
`node scripts/split-seed-themealdb.js seed-pl/seed-themealdb-pl.sql`  
Powstaną pliki w `supabase/seed-pl/`: `seed-themealdb-pl-part-01.sql` … do importu w SQL Editor.

## Krok 2: Uruchom migracje Supabase (jeśli jeszcze nie)

Upewnij się, że w bazie są tabele i kolumny:

- `recipes` (z kolumnami: id, name, description, meal_type, servings, …)
- `recipe_ingredients`
- `recipe_steps`

Jeśli używasz migracji z tego repo:

```bash
supabase db push
```

albo uruchom migracje ręcznie w Supabase Dashboard (SQL Editor) w kolejności:  
`20260312110000` → `20260314100000` → `20260315100000` → `20260316100000`.

## Krok 3: Zaimportuj przepisy do bazy

Pełne pliki seed są zbyt duże dla SQL Editor. Użyj **podzielonych plików**.

1. **Gdzie co leży:**  
   - **`supabase/seed-en/`** – przepisy po angielsku (nieprzetłumaczone): pełny plik + part-01 … part-24.  
   - **`supabase/seed-pl/`** – przepisy po polsku (przetłumaczone): pełny plik; po podziale także part-01 … part-24.
2. Podział (jeśli potrzeba):  
   - EN: `node scripts/split-seed-themealdb.js`  
   - PL: `node scripts/split-seed-themealdb.js seed-pl/seed-themealdb-pl.sql`
3. W **Supabase** → **SQL Editor** uruchom pliki **po kolei** (part-01, part-02, …): skopiuj zawartość → wklej → **Run**.

Tylko **part-01** zawiera na początku usunięcie starych importów TheMealDB; kolejność ma znaczenie.

## Krok 4: Aplikacja

Po imporcie:

- **Ekran „Przepisy”** – lista z `useRecipes()` odczyta nowe przepisy z Supabase.
- **Filtry** – działają jak wcześniej: posiłek (śniadanie/obiad/podwieczorek), mięsne/bezmięsne, sortowanie.
- **„Możesz zrobić”** na stronie głównej – sugeruje przepisy na podstawie składników z listy (nazwy składników po angielsku z TheMealDB; dopasowanie może być słabsze niż przy polskich nazwach).

Jeśli chcesz **polskie nazwy składników**, możesz dodać w aplikacji słownik tłumaczeń (np. plik mapujący `Chicken` → `Kurczak`) i wyświetlać przetłumaczone etykiety.

## Źródło i licencja

- API: [TheMealDB.com](https://www.themealdb.com/)
- Zgodnie z ich regulaminem: użycie treści z API w projekcie jest dozwolone; przy publikacji aplikacji w sklepach sprawdź ich aktualne warunki (np. płatna subskrypcja dla app store).
