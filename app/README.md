# KupiMY to! (Expo app)

Expo (TypeScript) + Supabase – wspólna lista zakupów (KupiMY to!).

## Co jest w aplikacji

- **Auth:** logowanie / rejestracja (Supabase Auth)
- **Gospodarstwo:** założenie, kod zaproszenia, dołączenie po kodzie
- **Lista:** sekcje „Do kupienia" i „Kupione", dodawanie / usuwanie / odhaczanie w czasie rzeczywistym
- **W sklepie:** przycisk „W sklepie", wybór countdownu (5/10/20 min), odliczanie, blokada dopisywania dla pozostałych, „Zakończ zakupy", push do domowników (Expo Push Service)

## Uruchomienie

1. Zainstaluj zależności: `npm install`
2. Skopiuj szablon env i ustaw dane Supabase:
   ```bash
   cp .env.example .env
   ```
   Wypełnij w `.env`:
   - `EXPO_PUBLIC_SUPABASE_URL` — z [Supabase Dashboard](https://supabase.com/dashboard)
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` — klucz anon (public) tego samego projektu
3. Zastosuj migracje w projekcie Supabase (patrz `../supabase/README.md`).
4. Start: `npm run start`

Bez poprawnego `.env` aplikacja się uruchomi, ale wywołania Supabase będą się nie powodować.

## Expo Go (telefon)

Projekt jest na **Expo SDK 55**. Żeby uruchomić w Expo Go:

1. Zainstaluj **Expo Go** z App Store (iOS) lub Google Play (Android) i zaktualizuj do najnowszej wersji.
2. Upewnij się, że telefon i komputer są w **tej samej sieci Wi‑Fi**.
3. W katalogu `app` uruchom: `npm run start`.
4. W terminalu pojawi się **QR kod**. Zeskanuj go:
   - **Android:** w aplikacji Expo Go wybierz „Scan QR code”.
   - **iOS:** otwórz wbudowaną aplikację **Aparat**, skieruj na QR kod i dotknij powiadomienia.

Jeśli Expo Go pokaże **„Project is incompatible with this version of Expo Go"**:
- Zaktualizuj Expo Go do najnowszej wersji (SDK 55).
- Na **iOS** wersja pod SDK 55 bywa najpierw w **TestFlight** (beta) – [expo.dev](https://expo.dev/go) lub dokumentacja Expo.

**Push:** powiadomienia używają **Expo Push Service** (token z `getExpoPushTokenAsync`). Aby rejestrować token:
- Ustaw **EAS Project ID**: w `app.json` dodaj `"extra": { "eas": { "projectId": "GUID-z-expo.dev" } }` (GUID: [expo.dev](https://expo.dev) → projekt → Settings) **lub** w `.env`: `EXPO_PUBLIC_EAS_PROJECT_ID=GUID`.
- Test na **fizycznym urządzeniu** z przyznanymi uprawnieniami do powiadomień.
W Expo Go push może być ograniczony; do pełnego testu zalecany **development build** (`npx expo run:ios` / `npx expo run:android`).

**Testowanie powiadomień:** (1) Dwa konta w jednym gospodarstwie, (2) na drugim urządzeniu/kontie przyznaj powiadomienia i upewnij się, że EAS Project ID jest ustawiony, (3) z pierwszego konta naciśnij „W sklepie" lub „Za chwilę idę na zakupy!" – drugie urządzenie powinno dostać push. Edge Functions nie wymagają już FCM_SERVER_KEY (używany jest Expo Push API).

## Wdrożenie web (za darmo) – dostęp z każdego miejsca

Żeby korzystać z aplikacji w przeglądarce z dowolnego urządzenia (bez Expo Go i bez tego samego Wi‑Fi):

1. **Zbuduj wersję web** (lokalnie, żeby sprawdzić):
   ```bash
   npm run build:web
   ```
   Pliki trafią do katalogu `dist/`.

2. **Wdróż na darmowy hosting** – dwie proste opcje:

   ### Vercel (zalecane)

   **Szczegółowy przewodnik krok po kroku:** [docs/vercel-deployment.md](../docs/vercel-deployment.md) — tam jest opisany cały proces od założenia konta po pierwszy deploy i rozwiązywanie problemów.

   W skrócie:
   - Załóż konto na [vercel.com](https://vercel.com) (GitHub login).
   - **Add New Project** → wybierz repozytorium z tym kodem (albo wgraj przez **Vercel CLI**: `npx vercel` w katalogu `app`).
   - **Root Directory:** ustaw na `app` (jeśli projekt jest w repo jako podkatalog).
   - **Build Command:** `npm run build:web`
   - **Output Directory:** `dist`
   - W **Environment Variables** dodaj (z `.env`):
     - `EXPO_PUBLIC_SUPABASE_URL`
     - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Deploy. Dostęp: `https://twoj-projekt.vercel.app`.

   ### Netlify

   - Konto na [netlify.com](https://netlify.com).
   - **Add new site** → **Import an existing project** (Git) lub **Deploy manually** (wgraj folder `dist` po `npm run build:web` z katalogu `app`).
   - Przy imporcie z Git:
     - **Base directory:** `app`
     - **Build command:** `npm run build:web`
     - **Publish directory:** `app/dist`
   - W **Site settings → Environment variables** ustaw `EXPO_PUBLIC_SUPABASE_URL` i `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
   - Deploy. Dostęp: `https://nazwa.netlify.app`.

Po wdrożeniu możesz otworzyć link na telefonie, tablecie lub innym komputerze – aplikacja działa w przeglądarce, a dane są w Supabase (w chmurze), więc lista jest ta sama wszędzie.
