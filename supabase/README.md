# Supabase – migracje i funkcje (KupiMY to!)

## Migracje

Migracje znajdują się w `supabase/migrations/`. Konwencja nazw: `YYYYMMDDHHmmss_opis.sql`.

### Zastosowanie migracji

1. **Projekt zdalny (Supabase Hosted)**  
   Po skonfigurowaniu Supabase CLI i połączeniu z projektem:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
   lub:
   ```bash
   supabase migration up
   ```

2. **Lokalnie (Supabase Local)**  
   ```bash
   supabase start
   supabase db reset   # stosuje wszystkie migracje
   ```

Szczegóły: [Supabase CLI – Local Development](https://supabase.com/docs/guides/cli/local-development#database-migrations).

**Bez CLI:** Skopiuj zawartość plików migracji w kolejności nazw (np. `20260311100000_initial_schema.sql` → … → `20260311130000_household_name_and_in_store_options.sql`) do Supabase → SQL Editor → Run. Edge Functions wdróż przez Dashboard lub CLI.

### Obecny schemat (Story 1.2)

- **households** – gospodarstwa domowe (id, invite_code, name, created_at)
- **household_members** – powiązanie użytkowników z gospodarstwami (household_id, user_id, role)
- **list_items** – wspólna lista zakupów (household_id, label, status todo/bought, position, updated_at)
- **in_store_sessions** – sesje „W sklepie” (household_id, user_id, countdown_until, block_adding, created_at)
- **push_tokens** (Story 4.2) – tokeny Expo Push (ExponentPushToken[…]) per użytkownik/urządzenie (user_id, token, platform ios|android) do wysyłki push „W sklepie” i „Za chwilę idę”

**Funkcje:**  
- `get_household_id_by_invite_code(code text)` – zwraca id gospodarstwa po kodzie zaproszenia.  
- `create_household(p_invite_code text, p_name text DEFAULT '')` – tworzy gospodarstwo z nazwą i kodem (SECURITY DEFINER).  
- `update_household_name(p_household_id uuid, p_name text)` – zmienia nazwę gospodarstwa (tylko członek).

Na wszystkich tabelach włączone jest RLS; dostęp mają tylko użytkownicy będący członkami danego gospodarstwa (FR4, NFR4).

## Edge Functions

- **send-in-store-push** – wywoływana z klienta po włączeniu „W sklepie”; wysyła powiadomienia (Expo Push API) do pozostałych członków gospodarstwa.
- **send-shopping-warning-push** – wywoływana po „Za chwilę idę na zakupy!”; wysyła do domowników powiadomienie „Masz 15 minut na dodanie produktów”.

Obie funkcje **weryfikują JWT** z nagłówka `Authorization`: wywołujący musi być zalogowany i jego `auth.uid()` musi zgadzać się z `shopperUserId` / `senderUserId` z body (401/403 w przeciwnym razie). W Edge Functions ustaw sekret **SUPABASE_ANON_KEY** (anon key projektu), żeby weryfikować token – Dashboard → Project Settings → Edge Functions → Secrets.

Współdzielone moduły w `functions/_shared/`: `cors.ts`, `auth.ts` (weryfikacja JWT), `push.ts` (pobieranie tokenów Expo członków gospodarstwa i wysyłka przez Expo Push API).

### Konfiguracja push (Expo Push Service)

Edge Functions wysyłają powiadomienia przez **Expo Push API** (https://exp.host/--/api/v2/push/send). Nie jest wymagany FCM ani żadne dodatkowe sekrety w Supabase. Aplikacja musi rejestrować **Expo push token** (`getExpoPushTokenAsync`) i zapisywać go w tabeli `push_tokens`; wymagany jest **EAS Project ID** (w `app.json` → `expo.extra.eas.projectId` lub `EXPO_PUBLIC_EAS_PROJECT_ID` w `.env`). Zobacz `app/README.md` – sekcja Push.
