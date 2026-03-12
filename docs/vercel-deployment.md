# Wdrożenie KupiMY to! na Vercel — krok po kroku

Ten dokument opisuje **cały proces** wdrożenia aplikacji webowej KupiMY to! na Vercel, od zera. Nie zakłada wcześniejszej znajomości Vercela.

---

## Co będziesz potrzebować

- **Konto na GitHub** — repozytorium z kodem projektu (np. `kupimy-to`).
- **Konto na Vercel** — założysz je przez GitHub (zalogowanie przez GitHub).
- **Dane z Supabase** — URL projektu i klucz anon (anon key) z [Supabase Dashboard](https://supabase.com/dashboard) → wybrany projekt → **Settings** → **API**.

---

## Krok 1: Konto na Vercel i połączenie z GitHub

1. Wejdź na [vercel.com](https://vercel.com).
2. Kliknij **Sign Up** (lub **Log In**, jeśli już masz konto).
3. Wybierz **Continue with GitHub**.
4. Zatwierdź uprawnienia — Vercel będzie mógł odczytywać Twoje repozytorium i automatycznie budować przy pushu.
5. Po zalogowaniu trafisz na **Dashboard** (lista projektów; na początku pusta).

---

## Krok 2: Nowy projekt z repozytorium GitHub

1. Na stronie głównej Vercel kliknij **Add New…** → **Project** (albo przycisk **Add New Project**).
2. Zobaczysz listę repozytoriów z GitHub. **Wybierz repozytorium**, w którym jest kod KupiMY to! (np. `kupimy-to`).
   - Jeśli nie widzisz repo: **Adjust GitHub App Permissions** i dodaj dostęp do organizacji/repo.
3. Kliknij **Import** przy wybranym repozytorium.

---

## Krok 3: Konfiguracja projektu (ważne ustawienia)

Po imporcie Vercel pokaże ekran konfiguracji. **Projekt ma aplikację w podkatalogu `app`**, więc trzeba to ustawić.

### 3.1 Root Directory (katalog główny)

- Znajdź pole **Root Directory**.
- Kliknij **Edit** obok niego.
- Wybierz z listy katalog **`app`** (albo wpisz: `app`).
- Dzięki temu Vercel będzie uruchamiał `npm install` i `npm run build:web` **wewnątrz** `app`, a nie w root repo.

### 3.2 Framework Preset

- **Framework Preset:** możesz zostawić **Other** albo **Vite** — i tak używamy własnej komendy build. Expo export generuje statyczne pliki, więc preset nie jest krytyczny.

### 3.3 Build and Output Settings

Upewnij się, że:

| Ustawienie           | Wartość                |
|----------------------|------------------------|
| **Build Command**    | `npm run build:web`    |
| **Output Directory** | `dist`                 |
| **Install Command**  | (domyślnie) `npm install` |

Jeśli któregoś pola nie ma na pierwszym ekranie — będzie w **Settings** projektu po utworzeniu (patrz niżej).

---

## Krok 4: Zmienne środowiskowe (Environment Variables)

Bez nich aplikacja się zbuduje, ale po otwarciu w przeglądarce nie połączy się z Supabase (błąd / pusta lista).

1. Na tym samym ekranie konfiguracji znajdź sekcję **Environment Variables**.
2. Dodaj **dwie** zmienne:

   | Name                         | Value |
   |-----------------------------|--------|
   | `EXPO_PUBLIC_SUPABASE_URL`  | URL Twojego projektu Supabase, np. `https://xxxxxxxx.supabase.co` |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Klucz **anon (public)** z Supabase (Settings → API) |

   Wartości skopiuj z pliku **`app/.env`** (te same, których używasz lokalnie).

3. Dla każdej zmienne możesz zostawić **Production**, **Preview** i **Development** zaznaczone — wtedy będą dostępne przy każdym buildzie.

---

## Krok 5: Deploy (pierwsze wdrożenie)

1. Kliknij **Deploy**.
2. Vercel:
   - sklonuje repo,
   - wejdzie do katalogu `app`,
   - wykona `npm install`,
   - ustawi zmienne środowiskowe,
   - wykona `npm run build:web`,
   - opublikuje zawartość katalogu `dist` na CDN.
3. Poczekaj 1–3 minuty. Na końcu zobaczysz **Congratulations!** i link do strony, np.:
   - `https://kupimy-to-xxxx.vercel.app`
   - lub `https://twoje-repo.vercel.app` — zależnie od nazwy projektu.

4. **Kliknij link** — powinna otworzyć się aplikacja KupiMY to! w przeglądarce. Zaloguj się / załóż gospodarstwo i sprawdź, czy lista ładuje się z Supabase.

---

## Co dalej: kolejne wdrożenia

- Przy każdym **pushu** na branch (np. `main`) Vercel automatycznie zbuduje i wdroży nową wersję.
- Previewy: przy pull requestach Vercel tworzy osobny adres (preview) z wersją z PR.

---

## Gdy coś pójdzie nie tak

### Build się nie udaje

- Wejdź w **Project** → **Deployments** → kliknij nieudany deployment → **Building** (logi).
- Sprawdź, czy **Root Directory** to `app` i czy **Build Command** to `npm run build:web`, **Output Directory** to `dist`.
- Lokalnie w katalogu `app` uruchom: `npm run build:web` — jeśli u Ciebie działa, na Vercelu też powinno po poprawie ustawień.

### Strona się ładuje, ale lista nie działa / błąd połączenia

- To zwykle brak lub zła **zmienna środowiskowa**. W projekcie Vercel: **Settings** → **Environment Variables**. Sprawdź:
  - `EXPO_PUBLIC_SUPABASE_URL` — bez końcowego slasha, pełny URL.
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY` — klucz **anon**, nie service_role.
- Po zmianie zmiennych zrób **Redeploy**: **Deployments** → trzy kropki przy ostatnim deployu → **Redeploy**.

### 404 przy odświeżaniu podstrony (np. /register)

- Aplikacja to SPA (single page). Vercel zwykle wykrywa to i ustawia **rewrites** tak, żeby wszystkie ścieżki zwracały `index.html`. Jeśli masz 404:
  - W **Settings** → **Rewrites** dodaj regułę: Source `/(.*)`, Destination `/index.html` (albo użyj domyślnego presetu dla SPA, jeśli Vercel go oferuje).

---

## Podsumowanie — checklist przed Deploy

- [ ] Repo na GitHub z kodem projektu.
- [ ] Root Directory ustawione na **`app`**.
- [ ] Build Command: **`npm run build:web`**.
- [ ] Output Directory: **`dist`**.
- [ ] Dodane zmienne: **`EXPO_PUBLIC_SUPABASE_URL`** i **`EXPO_PUBLIC_SUPABASE_ANON_KEY`**.
- [ ] Klik **Deploy** i sprawdzenie linku w przeglądarce.

Po tym wdrożeniu możesz otwierać link (np. na telefonie) i korzystać z KupiMY to! w przeglądarce — dane są w Supabase, więc lista jest wspólna na wszystkich urządzeniach.
