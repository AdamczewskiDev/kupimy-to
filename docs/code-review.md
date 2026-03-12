# Code review – KupiMY to!

Dokument podsumowuje przegląd kodu oraz zmiany wprowadzone na jego podstawie.

---

## 1. Wprowadzone zmiany (po review)

### Migracje

- **Kolejność:** Plik `20250311000000_household_name_and_in_store_options.sql` przemianowany na `20260311130000_household_name_and_in_store_options.sql`, żeby stosować się po migracjach ze schematem początkowym (20260311*). Migracje należy uruchamiać w kolejności nazw plików.

### Edge Functions (push)

- **Auth (JWT):** Obie funkcje (`send-in-store-push`, `send-shopping-warning-push`) weryfikują nagłówek `Authorization: Bearer <jwt>`. Tylko użytkownik, którego `auth.uid()` zgadza się z `shopperUserId` / `senderUserId` z body, może wywołać wysyłkę (401 Unauthorized przy braku tokenu, 403 Forbidden przy niezgodności).
- **CORS:** `send-shopping-warning-push` korzysta z współdzielonego `_shared/cors.ts` (jak `send-in-store-push`).
- **DRY:** Wspólna logika „pobierz członków gospodarstwa → tokeny FCM” jest w `_shared/push.ts` (`sendPushToHouseholdExceptUser`). Weryfikacja JWT w `_shared/auth.ts` (`getAuthenticatedUserId`).
- **Sekret:** Do weryfikacji JWT potrzebny jest **SUPABASE_ANON_KEY** w sekretach Edge Functions (Dashboard → Project Settings → Edge Functions).

### Aplikacja (Expo)

- **Realtime:** W `useListItems` i `useInStoreSession` kanał Realtime jest trzymany w ref i przy unmount zawsze usuwany; dodana flaga `cancelled`, żeby nie subskrybować po odmontowaniu (brak wycieku kanału).
- **JoinByCodeScreen:** Używa `useTheme()` i kolorów z kontekstu (motyw jasny/ciemny), `contentWrap` jak na ekranach logowania, stała `INVITE_CODE_MAX_LENGTH` z config.
- **Stałe:** W `app/src/config/constants.ts`: `WARNING_COUNTDOWN_MINUTES` (15), `AUTO_IN_STORE_MINUTES` (25), `INVITE_CODE_MAX_LENGTH` (12). Użyte w HomeScreen i w Edge Function (tekst push).
- **inviteCode:** Usunięty nieużywany plik `app/src/lib/inviteCode.ts`. Generowanie kodu można dodać później (np. przycisk „Sugeruj kod”).
- **Supabase web:** W `app/src/lib/supabase.web.ts` ustawione `detectSessionInUrl: true`, żeby na webie sesja z magic link / OAuth była przywracana z URL.
- **Dostępność:** Dodane `accessibilityLabel` do głównych akcji: menu, „W sklepie”, „Za chwilę idę”, pole „Nazwa pozycji”, „Dodaj”, Odhacz/Usuń (z nazwą pozycji), kategorie (z nazwą), logowanie/rejestracja (pola i przyciski), JoinByCode (pole kodu, Dołącz, Anuluj).
- **fix-households-rls.sql:** Na początku pliku dopisany komentarz, że to wersja legacy (create_household bez nazwy); aplikacja korzysta z sygnatury z migracji; nie uruchamiać na bazie z już zastosowanymi migracjami.

---

## 2. Co zostało uznane za dobre (bez zmian)

- Struktura app (ThemeProvider → AuthProvider → nawigacja), hooki z loading/error, RLS i funkcje SECURITY DEFINER w Supabase.
- Brak sekretów w kliencie (tylko EXPO_PUBLIC_*), `.env.example` bez wartości wrażliwych.
- Typy (ListItem, InStoreSession, Household, ShoppingCategory), Realtime z REPLICA IDENTITY FULL.

---

## 3. Dalsze rekomendacje (opcjonalnie)

- **Typy:** Stopniowo ograniczać `Record<string, unknown>` w hookach (np. wygenerowane typy z Supabase CLI).
- **Dostępność:** Rozważyć `accessibilityHint` przy skomplikowanych akcjach oraz `accessibilityState` (np. busy przy ładowaniu).
- **Stałe w Edge Function:** Wartość „15 minut” w treści push jest w stałej `WARNING_MINUTES` w `send-shopping-warning-push`; z app współdzielone są tylko sens (15 / 25 min) przez dokumentację i nazwy stałych.

---

## 4. Pliki zmienione / dodane

| Obszar | Pliki |
|--------|--------|
| Migracje | `supabase/migrations/20260311130000_household_name_and_in_store_options.sql` (rename) |
| Edge Functions | `_shared/auth.ts`, `_shared/push.ts` (nowe), `send-in-store-push/index.ts`, `send-shopping-warning-push/index.ts` |
| App | `app/src/config/constants.ts` (nowy), `app/src/hooks/useListItems.ts`, `app/src/hooks/useInStoreSession.ts`, `app/src/screens/JoinByCodeScreen.tsx`, `app/src/screens/HomeScreen.tsx`, `app/src/screens/LoginScreen.tsx`, `app/src/screens/RegisterScreen.tsx`, `app/src/lib/supabase.web.ts` |
| Usunięte | `app/src/lib/inviteCode.ts` |
| Supabase | `supabase/fix-households-rls.sql` (komentarz) |
| Docs | `supabase/README.md`, `docs/code-review.md` (ten plik) |
