# Burza mózgów: 10 spotkań agentów kreatywnych i technicznych

Dokument zawiera zapis dziesięciu spotkań roboczych między „agentem kreatywnym” (UX, wartość dla użytkownika, pomysły) a „agentem technicznym” (feasibility, architektura, koszt). Na wejściu: 6 propozycji użytkownika. Na wyjściu: uszeregowane pomysły oraz propozycja funkcji na kolejny sprint.

---

## Propozycje wejściowe (od użytkownika)

1. **Inne kolory** – zmiana palety / motywu wizualnego.
2. **Propozycje przepisów na podstawie listy** – baza przepisów, dopasowanie do produktów z listy.
3. **Sortowanie listy** – po kategoriach i po przepisach.
4. **Miejsce na przepisy** – dodatkowy moduł / sekcja przepisów na jedzenie.
5. **Ilości i jednostki** – dodawanie produktów z ilością (szt., kg, ml, opakowania).
6. **Integracja z Cookido** – połączenie z platformą Cookido (Thermomix / przepisy). **Na ten sprint wyłączone** – na to miejsce wybierzemy inną integrację później.

---

## Spotkanie 1: Kolory i identyfikacja wizualna

**Kreatywny:** Inne kolory to najszybszy sposób na „odświeżenie” bez zmiany logiki. Możemy dać użytkownikowi wybór kilku gotowych motywów (np. „Las”, „Morze”, „Minimal”) zamiast tylko jasny/ciemny.

**Techniczny:** Obecnie mamy `ThemeContext` z `lightColors` i `darkColors`. Rozszerzenie na N motywów to nowy enum/typ + mapa kolorów. Brak nowych tabel w bazie. Szacunek: 1–2 dni na 3–4 motywy + wybór w ustawieniach.

**Wniosek:** Niski koszt, duży efekt wizerunkowy. Wsadzamy do backlogu jako „Theme presets”.

---

## Spotkanie 2: Przepisy na podstawie listy – baza i dopasowanie

**Kreatywny:** Użytkownik widzi listę „Pomidory, Cebula, Czosnek” i dostaje sugestię „Pomidorowa” albo „Bolognese”. To zwiększa użyteczność listy i przywiązanie do appki.

**Techniczny:** Potrzebna tabela `recipes` (id, name, description, url/body?), tabela `recipe_ingredients` (recipe_id, ingredient_name_normalized, optional?). Dopasowanie: dla listy pozycji szukamy przepisów, których „ingredient set” jest podzbiorem (lub pokryciem) listy. Normalizacja nazw (mleko = Mleko = mleko) po stronie zapytań. Można zacząć od statycznej bazy (pliki JSON / seed SQL), potem edycja przez admina lub crowdsourcing.

**Kreatywny:** Czy nie lepiej zewnętrzne API przepisów?

**Techniczny:** API typu Spoonacular/Edamam są płatne po free tier. Własna baza daje kontrolę i brak kosztów per request. Na start lepiej własna baza + później opcjonalnie API.

**Wniosek:** Własna baza przepisów + endpoint/query „sugeruj przepisy po liście”. Średni zakres (schemat, seed, algorytm dopasowania, UI sugestii).

---

## Spotkanie 3: Sortowanie listy – kategorie i przepisy

**Kreatywny:** Sortowanie po kategoriach (nabiał, pieczywo…) ułatwia zakupy w sklepie. Sortowanie „po przepisach” to grupowanie pozycji wg przepisu (np. „Na pomidorową: pomidory, cebula…”).

**Techniczny:** Lista ma już `position` i `status`. Kategorie mamy w `SHOPPING_CATEGORIES` (front). Opcje: (A) przypisanie pozycji do kategorii (pole `category_id` lub tag) + sort po kategorii; (B) grupowanie w UI bez zmiany modelu – mapowanie label→kategoria po nazwie. Sortowanie „po przepisach” wymaga powiązania pozycji z przepisem (np. `list_item.recipe_id` lub osobna tabela „list_item – recipe”).

**Kreatywny:** Na początek wystarczy grupowanie w widoku (kategorie z danych produktów), bez obowiązkowego przypisywania przepisu do każdej pozycji.

**Wniosek:** Sortowanie/groupowanie po kategoriach – realne od razu (front + ewentualnie pole kategorii). Sortowanie po przepisach – po wprowadzeniu modułu przepisów i powiązań lista–przepis.

---

## Spotkanie 4: Miejsce na przepisy (sekcja / moduł)

**Kreatywny:** Osobna zakładka lub sekcja „Przepisy” – ulubione, ostatnio używane, wyszukiwarka, dodawanie z listy do przepisu.

**Techniczny:** To rozszerzenie punktu 2. Tabele: `recipes`, `recipe_ingredients`, opcjonalnie `household_recipes` (ulubione per gospodarstwo) lub `user_favorite_recipes`. Ekran/stack „Przepisy” w nawigacji. Lista przepisów, szczegóły przepisu, przycisk „Dodaj składniki do listy”.

**Kreatywny:** Czy przepisy są globalne czy per gospodarstwo?

**Techniczny:** Na start globalna baza (wspólna), potem ewentualnie „Moje przepisy” (per user lub household) – unikamy duplikacji w MVP.

**Wniosek:** Moduł przepisów = baza + UI (lista, szczegóły, „dodaj do listy”). Naturalna kolejność po „sugestie przepisów z listy”.

---

## Spotkanie 5: Ilości i jednostki (szt., kg, ml, opak.)

**Kreatywny:** „Mleko 2 szt.”, „Mąka 1 kg” – standard w listach zakupów. Zmniejsza pomyłki i ułatwia planowanie.

**Techniczny:** Rozszerzenie `list_items`: `quantity` (real/decimal), `unit` (enum: szt, kg, g, l, ml, opakowanie, inna). W UI: pole ilości + dropdown jednostki przy dodawaniu/edycji. Kategorie mogą mieć domyślne jednostki (np. nabiał → szt/l). Migracja: ALTER TABLE + backfill (np. 1 szt).

**Kreatywny:** Czy opakowanie to zawsze „1 opakowanie” czy „2 opakowania”?

**Techniczny:** Traktujemy „opakowanie” jak jednostkę; ilość to liczba (1, 2, 0.5). Wystarczy.

**Wniosek:** Bardzo użyteczne, scope ograniczony do modelu + formularza. Dobry kandydat na ten sam sprint co przepisy lub osobny mały sprint.

---

## Spotkanie 6: Integracja z Cookido

**Kreatywny:** Cookido to baza przepisów Thermomix; użytkownicy mogliby importować listy składników z przepisów Cookido do naszej listy.

**Techniczny:** Cookido to produkt Thermomix; nie ma publicznego, darmowego API dla zwykłych deweloperów. Integracja wymagałaby: (A) oficjalnej umowy z Vorwerk / Cookido, albo (B) nieoficjalnego scrapingu (ryzyko prawne i zmiany w stronie). Bez API oficjalnego nie możemy obiecywać integracji w roadmapie.

**Kreatywny:** A link „Otwórz w Cookido” do wyszukania przepisu po nazwie?

**Techniczny:** Link do wyszukiwarki Cookido (np. query w URL) to tylko UX, bez API – dopuszczalne. Pełna integracja (import listy z Cookido) – tylko po udostępnieniu API lub partnerstwie.

**Wniosek:** Na teraz: ewentualnie link „Szukaj w Cookido” przy przepisie. Pełna integracja – w backlogu z adnotacją „blokada: brak publicznego API”.

---

## Spotkanie 7: Pomysły pochodne – powiadomienia i nawyki

**Kreatywny:** Skoro mamy przepisy i listę – czy „przypomnienie: często kupujesz te produkty w piątek, dodaj do listy?” albo „Masz wszystko do pomidorowej, może dziś ugotować?”.

**Techniczny:** Wymaga historii list (co było kupowane, kiedy) i/lub zapisanych „szablonów list”. Obecnie nie trzymamy historii – tylko aktualny stan. To osobna epika: historie zakupów / szablony. Warto zapisać, ale nie na ten sprint.

**Wniosek:** Backlog: „Historia list / szablony” oraz „Inteligentne przypomnienia”.

---

## Spotkanie 8: Współdzielone listy a przepisy

**Kreatywny:** Czy „dodaj składniki z przepisu do listy” ma dodawać wszystkie, czy użytkownik wybiera które?

**Techniczny:** Lepszy UX: pokazujemy listę składników przepisu z checkboxami, domyślnie wszystkie zaznaczone; użytkownik odznacza to, czego nie potrzebuje. Jedna akcja „Dodaj wybrane do listy”.

**Kreatywny:** I od razu z ilościami i jednostkami z przepisu.

**Techniczny:** Tak – jeśli przepisy mają quantity + unit per składnik, lista dostaje to samo. Spójne z propozycją 5.

**Wniosek:** Przepisy i ilości/jednostki idą w parze; „dodaj do listy z przepisu” z wyborem składników i z quantity/unit.

---

## Spotkanie 9: Priorytetyzacja i zależności

**Techniczny:** Proponowana kolejność: (1) Ilości i jednostki – niezależne, mały zakres. (2) Baza przepisów + sugestie z listy – fundament. (3) Moduł „Przepisy” (ekran, lista, szczegóły, dodaj do listy). (4) Sortowanie/groupowanie po kategoriach i po przepisach – korzysta z (2)(3). (5) Motywy kolorów – niezależne. (6) Cookido – tylko link; pełna integracja wstrzymana.

**Kreatywny:** Użytkownik od razu zobaczy wartość, jeśli najpierw zobaczy „masz na liście X, Y, Z – oto przepis”. Więc sugestie przepisów przed pełnym modułem przepisów?

**Techniczny:** Można: najpierw „Sugerowane przepisy” (blok na Home nad lub pod listą) z prostą listą i linkiem „Zobacz”. Pełny ekran Przepisy w następnej iteracji.

**Wniosek:** MVP przepisów = sugestie na podstawie listy + prosty widok przepisu (np. modal lub osobna strona). Później: pełny moduł z ulubionymi i wyszukiwarką.

---

## Spotkanie 10: Scope kolejnego sprintu – podsumowanie

**Ustalenia:**

- **Must-have w kolejnym sprincie:**  
  - Ilości i jednostki przy pozycjach listy (quantity, unit).  
  - Baza przepisów (tabele + seed) + algorytm „sugeruj przepisy po liście”.  
  - Blok „Sugerowane przepisy” na ekranie głównym + prosty widok przepisu (np. modal) z przyciskiem „Dodaj składniki do listy” (z wyborem składników i ilościami).

- **Nice-to-have w tym samym sprincie (jeśli starczy czasu):**  
  - Groupowanie listy po kategoriach (w widoku).  
  - 1–2 dodatkowe motywy kolorów (presety).

- **Kolejny sprint (następny):**  
  - Pełny moduł „Przepisy” (ekran, lista, ulubione, wyszukiwarka).  
  - Sortowanie listy po przepisach (gdy pozycje powiązane z przepisem).  
  - Ewentualny link „Szukaj w Cookido” przy przepisie.

- **Backlog (później):**  
  - Historia list / szablony, inteligentne przypomnienia.  
  - Pełna integracja Cookido (warunek: API/partnerstwo).  
  - Własne przepisy per gospodarstwo/użytkownik.

---

## Dodatkowe funkcje wypracowane w trakcie spotkań

| Pomysł | Opis | Priorytet |
|--------|------|-----------|
| Theme presets | Kilka gotowych motywów (Las, Morze, Minimal) zamiast tylko jasny/ciemny | Niski |
| Historia list / szablony | Zapisywanie powtarzających się list, „dodaj szablon” | Średni (backlog) |
| Inteligentne przypomnienia | „Często kupujesz X w piątek”, „Masz wszystko do przepisu Y” | Średni (backlog) |
| Dodaj z przepisu z wyborem | Checkboxy przy składnikach, ilości z przepisu | W sprincie (z przepisami) |
| Link „Szukaj w Cookido” | URL do wyszukiwarki Cookido (bez API) | Nice-to-have |
| Ulubione przepisy | Per user lub per household | Następny sprint |

---

## Rekomendacja na kolejny sprint (dokument roboczy)

**Cel sprintu:** Lista zakupów z ilościami/jednostkami oraz pierwsza wersja „przepisów” – sugestie na podstawie listy i dodawanie składników do listy.

**Zakres:**

1. **Ilości i jednostki**  
   - Migracja: `list_items.quantity`, `list_items.unit` (enum lub text).  
   - UI: pole ilości + wybór jednostki przy dodawaniu/edycji; domyślnie 1 szt.  
   - Wyświetlanie na liście: np. „Mleko 2 szt.”.

2. **Baza przepisów**  
   - Tabele: `recipes` (id, name, description, source_url?), `recipe_ingredients` (recipe_id, ingredient_label, quantity, unit, position).  
   - Seed: 5–10 prostych przepisów (np. z SHOPPING_CATEGORIES).  
   - Normalizacja: prosty match po nazwie (lowercase, trim, ewentualnie synonyms).

3. **Sugestie przepisów**  
   - Zapytanie: dla aktualnych pozycji listy (todo) znaleźć przepisy, których składniki w max. stopniu pokrywają listę.  
   - Blok na Home: „Możesz zrobić: [Przepis A], [Przepis B]” z linkiem do widoku przepisu.

4. **Widok przepisu i „Dodaj do listy”**  
   - Modal lub osobny ekran: nazwa, opis, lista składników (z ilościami/jednostkami).  
   - Przycisk „Dodaj składniki do listy”: checkboxy przy składnikach (domyślnie wszystkie), dodanie wybranych do `list_items` z quantity i unit.

5. **Opcjonalnie w tym sprincie**  
   - Groupowanie widoku listy po kategoriach (np. sekcje „Nabiał”, „Pieczywo” na podstawie mapowania nazwa→kategoria).  
   - 1–2 dodatkowe motywy kolorów (ThemeContext: nowe presety).

**Po sprincie:** Decyzja o pełnym module „Przepisy” (ekran, ulubione, wyszukiwarka) i sortowaniu listy po przepisach w kolejnej iteracji.

---

## Status sprintu (wdrożenie)

- **Cookido:** Wyłączone z zakresu; na to miejsce wybierzemy inną integrację później.
- **Zrealizowane:**
  - **Ilości i jednostki:** Migracja `20260312100000_list_items_quantity_unit.sql` (quantity, unit); w app: stałe `LIST_ITEM_UNITS`, formularz z ilością i chipami jednostek, wyświetlanie np. „Mleko (2 szt)”.
  - **Baza przepisów:** Migracja `20260312110000_recipes_and_ingredients.sql` (tabele `recipes`, `recipe_ingredients` + seed 5 przepisów).
  - **Sugerowane przepisy:** Hook `useSuggestedRecipes`, blok „Możesz zrobić” na Home (przepisy z ≥2 dopasowanymi składnikami), modal przepisu ze składnikami (checkboxy) i przycisk „Dodaj wybrane do listy”.
- **Do zrobienia (opcjonalnie w tym sprincie):** Groupowanie listy po kategoriach, dodatkowe motywy kolorów.

---

*Dokument powstał na podstawie 10 fikcyjnych spotkań burzy mózgów (agenty kreatywny vs techniczny). Propozycje użytkownika: kolory, przepisy z listy, sortowanie, miejsce na przepisy, ilości/jednostki, Cookido (wyłączone).*
