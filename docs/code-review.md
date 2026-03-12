# Code review – KupiMY to!

Szczegółowy przegląd kodu (Expo app + Supabase). Obejmuje architekturę, bezpieczeństwo, React/Expo, bazę, Edge Functions oraz konkretne rekomendacje.

---

## 1. Architektura i struktura

### 1.1 Ogólna ocena

- **App:** Czysta hierarchia providerów (`SafeAreaProvider` → `ThemeProvider` → `AuthProvider` → `NavigationContainer`), ekrany z hookami (`useHousehold`, `useListItems`, `useInStoreSession`, `usePushTokenRegistration`). Konfiguracja w `config/` (app, constants), typy w `types/`, dane statyczne w `data/`.
- **Supabase:** Migracje w kolejności czasowej, RLS na wszystkich tabelach, funkcje `SECURITY DEFINER` z jawnym `SET search_path = public`, Edge Functions z weryfikacją JWT i inline’owanym kodem (bez `_shared` przy deploy z Dashboardu).

### 1.2 Uwagi

- **Duży HomeScreen** (~1300 linii) – wiele stanów lokalnych i modali w jednym pliku. Opcjonalnie: wydzielenie logiki „Za chwilę idę” / „W sklepie” do custom hooka, modale do osobnych komponentów (np. `MenuModal`, `InStoreModal`, `CategoryPickerModal`).
- **Dwa klienty Supabase** (`supabase.ts` vs `supabase.web.ts`) – tylko `detectSessionInUrl` się różni; wejście (np. `index.ts` vs `index.web.ts`) wybiera odpowiedni plik. Rozwiązanie OK.

---

## 2. Bezpieczeństwo

### 2.1 Co jest w porządku

- **Klient:** Tylko `EXPO_PUBLIC_SUPABASE_URL` i `EXPO_PUBLIC_SUPABASE_ANON_KEY`; brak haseł ani service_role w app.
- **RLS:** Włączone na `households`, `household_members`, `list_items`, `in_store_sessions`, `push_tokens`. Dostęp przez `is_household_member(household_id)` lub `user_id = auth.uid()`.
- **Edge Functions:** Identyfikacja użytkownika przez JWT (`Authorization: Bearer <token>`), weryfikacja że `auth.uid()` === `shopperUserId` / `senderUserId` z body (403 przy niezgodności). Service role tylko wewnątrz funkcji do odczytu `push_tokens` i `household_members`.
- **Funkcje SQL:** `create_household`, `update_household_name`, `get_household_id_by_invite_code` – `SECURITY DEFINER`, `SET search_path = public`, sprawdzenie `auth.uid()` / `is_household_member`.

### 2.2 Do rozważenia

- **CORS:** `Access-Control-Allow-Origin: '*'` – akceptowalne dla publicznego anon API; jeśli kiedyś będą wrażliwe nagłówki lub cookies, warto zawęzić origin.
- **Sekret Edge Functions:** W dokumentacji jest `SUPABASE_ANON_KEY` do weryfikacji JWT; w Supabase bywa nazwa `SUPABASE_ANON_KEY` lub tylko anon key w dashboardzie – upewnij się, że w sekretach Edge Functions jest ustawiony **anon key** projektu (ta sama wartość co w app).
- **household_members INSERT:** RLS zezwala na `INSERT` z `user_id = auth.uid()` dla dowolnego `household_id`. Aplikacja podaje `household_id` tylko po wywołaniu `get_household_id_by_invite_code` (kod od użytkownika). Ryzyko: ktoś mógłby wywołać API z dowolnym `household_id` i dołączyć się bez kodu. Ograniczenie: wymagałoby znajomości UUID gospodarstwa; można w przyszłości dodać tabelę „zaproszeń” (token jednorazowy) i w RLS sprawdzać tylko takie zaproszenia.

---

## 3. React / Expo

### 3.1 Hooks i efektów

- **useHousehold:** `fetchHousehold` w `useCallback` z zależnością `[user?.id]`, `useEffect(() => fetchHousehold(), [fetchHousehold])` – poprawne.
- **useListItems:** Subskrypcja Realtime w `useEffect` z cleanup: `cancelled`, `channelRef`, `supabase.removeChannel(ch)` w return – brak wycieku kanału.
- **useInStoreSession:** Analogicznie – ref na kanał, cleanup przy odmontowaniu. Odliczanie „W sklepie” w osobnym `useEffect` z `setInterval` i `clearInterval` – OK.
- **usePushTokenRegistration:** `cancelled` przy async rejestracji tokenu – uniknięcie setState po unmount.

### 3.2 HomeScreen – timer „Za chwilę idę”

- **Stan:** `warningCountdownUntil` (timestamp końca) + `setCountdownTick` co 1 s wymuszający re-render – timer na ekranie się zmniejsza.
- **useEffect z setInterval:** `runStartSession` jest opakowane w `useCallback` z deps `[startSession, household?.id, user?.id]` i dodane do zależności efektu `[warningCountdownUntil, runStartSession]` – zgodnie z exhaustive-deps.

### 3.3 Inne

- **ThemeProvider:** Stan motywu w AsyncStorage – poprawne; brak hydratacji (krótki flash domyślnego motywu) – typowe dla tego wzorca.
- **AuthContext:** `onAuthStateChange` + `getSession()` – poprawne; `signOut` z try/catch i `__DEV__` log – OK.

---

## 4. Supabase (baza, migracje, Realtime)

### 4.1 Schemat i migracje

- **Kolejność:** `20260311100000_initial_schema` → `20260311110000_join_household_by_invite_code` → `20260311120000_push_tokens` → `20260311130000_household_name_and_in_store_options` – spójna.
- **Realtime:** `list_items` i `in_store_sessions` w publikacji `supabase_realtime`, `REPLICA IDENTITY FULL` – potrzebne do UPDATE/DELETE w Realtime.
- **Trigger:** `set_updated_at()` na `list_items` – `updated_at` przy każdym UPDATE.

### 4.2 RLS – podsumowanie

| Tabela              | SELECT                    | INSERT / UPDATE / DELETE |
|---------------------|---------------------------|---------------------------|
| households          | is_household_member(id)   | INSERT: auth.uid() IS NOT NULL |
| household_members   | user_id = auth.uid() \|\| is_household_member | INSERT: user_id = auth.uid(); UPDATE/DELETE: user_id = auth.uid() |
| list_items          | is_household_member       | Wszystkie: is_household_member |
| in_store_sessions   | is_household_member       | INSERT: member + user_id = auth.uid(); UPDATE/DELETE: member + user_id = auth.uid() |
| push_tokens         | user_id = auth.uid()      | Tylko własne wiersze |

### 4.3 Funkcje

- **get_household_id_by_invite_code(code):** Zwraca `uuid` (jeden wiersz). W app: `maybeSingle()` nie jest używane – wywołanie RPC zwraca wartość skalarną; w `useHousehold.joinHouseholdByCode` używane jest `householdId` z wyniku – poprawne (Supabase RPC zwraca pojedynczy uuid w tym przypadku).
- **create_household(p_invite_code, p_name):** Zwraca `TABLE(id, invite_code, name)`; w app odczyt `row.id`, `row.invite_code`, `row.name` – OK.
- **update_household_name(p_household_id, p_name):** `SECURITY DEFINER` + `is_household_member` – tylko członek może zmienić nazwę.

---

## 5. Edge Functions

### 5.1 send-in-store-push i send-shopping-warning-push

- **Kod:** Wszystko w jednym pliku (CORS, JWT, pobieranie tokenów, Expo Push API) – deploy działa także gdy bundler nie dołącza `_shared`.
- **Przepływ:** OPTIONS → 200; POST → odczyt JWT → walidacja body → sprawdzenie że `userId === shopperUserId`/`senderUserId` → Supabase (service role) → `household_members` + `push_tokens` → filtrowanie tokenów Expo → POST do `https://exp.host/--/api/v2/push/send`.
- **Błędy:** 400 przy braku pól, 401 bez tokenu, 403 przy niezgodności użytkownika; 500 z logowaniem w catch. Odpowiedź zawsze z CORS headers – OK.
- **Sekrety:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Supabase ustawia), `SUPABASE_ANON_KEY` (do JWT) – muszą być w Project Settings → Edge Functions → Secrets.

### 5.2 Stałe

- W `send-shopping-warning-push` jest `WARNING_MINUTES = 15`; w app `WARNING_COUNTDOWN_MINUTES = 15`. W obu plikach dodane są komentarze wzajemnie się odwołujące, żeby przy zmianie zaktualizować obie wartości.

---

## 6. UX i edge case’y

### 6.1 Obsłużone

- Brak Supabase config: `isSupabaseConfigured`, ostrzeżenie w __DEV__, AuthContext kończy ładowanie.
- Web: `detectSessionInUrl: true` – sesja z linku magic link/OAuth.
- Blokada dopisywania: „Zakupy w toku” + `isAddBlocked` – UI i logika spójne.
- Anulowanie „Za chwilę idę”: `cancelWarningCountdown()` czyści timer.
- Dostępność: `accessibilityLabel` na głównych przyciskach i polach (Login, Register, Home, JoinByCode).

### 6.2 Do rozważenia

- **Brak sesji po rejestracji:** Supabase może nie zwrócić `session` (np. wymagana potwierdzenie e-mail). Obecnie: komunikat „Potwierdź e-mail” + nawigacja do Logowania – OK.
- **Długie listy:** Brak wirtualizacji; dla bardzo długich list warto rozważyć `FlatList` z `windowSize` zamiast mapy w ScrollView.
- **Klawiatura na webie:** KeyboardAvoidingView może zachowywać się inaczej; na mobile zwykle OK.
- **Offline:** Brak jawnych retry/queue; przy utracie sieci użytkownik zobaczy błędy z Supabase. Na później: retry w hookach lub queue mutacji.

---

## 7. Wydajność

- **Realtime:** Jeden kanał na `household_id` dla list_items i jeden dla in_store_sessions; cleanup przy odmontowaniu – bez wycieków.
- **Odliczania:** Dwa setIntervaly („W sklepie” w useInStoreSession, „Za chwilę idę” w HomeScreen) – zatrzymywane w cleanup.
- **Obrazy:** Expo (assets) – bez ciężkich operacji; brak dużych list obrazów.
- **Build web:** `expo export --platform web` – statyczny export; Vercel serwuje z CDN – OK.

---

## 8. Jakość kodu i utrzymanie

### 8.1 Mocne strony

- TypeScript w app i w Edge Functions (Deno).
- Stałe w jednym miejscu (`constants.ts`, `app.ts`).
- Typy dla `ListItem`, `InStoreSession`, `Household`, `ShoppingCategory`.
- README (app, supabase, vercel-deployment) i ten code review.

### 8.2 Sugestie

- **Typy z Supabase:** Zamiast `Record<string, unknown>` i rzutowań w hookach można wygenerować typy (`supabase gen types typescript`) i używać ich w `.select()` i `mapRow`.
- **ESLint:** Włączyć `react-hooks/exhaustive-deps` i stopniowo poprawiać ostrzeżenia (np. `runStartSession` w deps lub useCallback).
- **Testy:** Brak testów jednostkowych – na później: krytyczne ścieżki (np. useHousehold.createHousehold, useListItems.addItem, walidacja JWT w Edge Functions w izolacji).
- **Duplikacja w Edge Functions:** Dwie funkcje mają ten sam blok (CORS, getAuthenticatedUserId, getHouseholdPushTokensExceptUser, sendExpoPushNotifications). Obecnie celowo inline pod deploy bez _shared; jeśli deploy będzie zawsze z CLI z _shared, można wrócić do importów.

---

## 9. Konkretne rekomendacje (akcje)

| Priorytet | Gdzie | Co | Status |
|-----------|--------|-----|--------|
| Niski | HomeScreen `useEffect` (timer „Za chwilę idę”) | Dodać `runStartSession` do tablicy zależności lub opakować w `useCallback` i wtedy dodać do deps. | **Wykonane:** `runStartSession` w `useCallback` z deps `[startSession, household?.id, user?.id]`, efekt z deps `[warningCountdownUntil, runStartSession]`. |
| Niski | send-shopping-warning-push | Trzymać `WARNING_MINUTES = 15` w jednej „źródłowej” definicji (komentarz w app + Edge Function). | **Wykonane:** W `constants.ts` komentarz odwołujący do Edge Function; w Edge Function komentarz „Musi być zgodne z WARNING_COUNTDOWN_MINUTES w app/…”. |
| Opcjonalnie | App (długoterminowo) | Rozbić HomeScreen na mniejsze komponenty/hooki (np. useWarningCountdown, MenuModal, CategoryPickerModal). | Do ewentualnej realizacji. |
| Opcjonalnie | Supabase | Wygenerować typy (`supabase gen types typescript`) i użyć w hookach. | Do ewentualnej realizacji. |
| Opcjonalnie | EAS projectId | Obecnie w app.json (extra.eas.projectId) – OK. | Bez zmian. |

---

## 10. Podsumowanie

- **Bezpieczeństwo:** RLS i Edge Functions z JWT są poprawnie skonfigurowane; brak sekretów w kliencie.
- **Stabilność:** Cleanup Realtime i intervalów zapobiega wyciekom; timer „Za chwilę idę” odświeża się co sekundę.
- **Deploy:** Edge Functions działają z inline kodem (Vercel/Dashboard); aplikacja web na Vercel z dwiema zmiennymi env; push przez Expo Push API bez FCM.
- **Utrzymanie:** Duży HomeScreen i zduplikowane stałe (app vs Edge Function) to główne obszary do ewentualnej poprawy; reszta jest spójna i czytelna.
