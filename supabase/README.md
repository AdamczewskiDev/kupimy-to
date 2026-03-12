# Supabase – migracje i funkcje (new-p)

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

**Bez CLI:** Skopiuj zawartość pliku `migrations/20250311000000_household_name_and_in_store_options.sql` do Supabase → SQL Editor → Run (dodaje kolumnę `name` do households, `block_adding` do in_store_sessions oraz funkcje `create_household` z nazwą i `update_household_name`). Nową Edge Function **send-shopping-warning-push** wdróż przez Dashboard lub CLI.

### Obecny schemat (Story 1.2)

- **households** – gospodarstwa domowe (id, invite_code, name, created_at)
- **household_members** – powiązanie użytkowników z gospodarstwami (household_id, user_id, role)
- **list_items** – wspólna lista zakupów (household_id, label, status todo/bought, position, updated_at)
- **in_store_sessions** – sesje „W sklepie” (household_id, user_id, countdown_until, block_adding, created_at)
- **push_tokens** (Story 4.2) – tokeny FCM per użytkownik/urządzenie (user_id, token, platform ios|android) do wysyłki push „W sklepie”

**Funkcje:**  
- `get_household_id_by_invite_code(code text)` – zwraca id gospodarstwa po kodzie zaproszenia.  
- `create_household(p_invite_code text, p_name text DEFAULT '')` – tworzy gospodarstwo z nazwą i kodem (SECURITY DEFINER).  
- `update_household_name(p_household_id uuid, p_name text)` – zmienia nazwę gospodarstwa (tylko członek).

Na wszystkich tabelach włączone jest RLS; dostęp mają tylko użytkownicy będący członkami danego gospodarstwa (FR4, NFR4).

## Edge Functions

- **send-in-store-push** – wywoływana z klienta po włączeniu „W sklepie”; wysyła powiadomienia FCM do pozostałych członków gospodarstwa.
- **send-shopping-warning-push** – wywoływana po „Za chwilę idę na zakupy!”; wysyła do domowników powiadomienie „Masz 15 minut na dodanie produktów”.

### Konfiguracja push (FCM)

1. **Firebase:** Załóż projekt w [Firebase Console](https://console.firebase.google.com/), włącz Cloud Messaging.  
2. **Klucz serwera (legacy):** Projekt → Ustawienia projektu → Cloud Messaging → Klucz serwera.  
3. **Sekret w Supabase:** W Dashboard → Project Settings → Edge Functions dodaj sekret `FCM_SERVER_KEY` z tym kluczem (lub lokalnie: `supabase secrets set FCM_SERVER_KEY=...`).  
4. **Aplikacja:** W development build (np. EAS Build) skonfiguruj `google-services.json` (Android) / pliki APNs (iOS) zgodnie z [Expo Push Notifications](https://docs.expo.dev/push-notifications/push-notifications-setup/).  

Bez ustawionego `FCM_SERVER_KEY` Edge Function zwraca 200 i nie wysyła powiadomień (graceful degradation).
