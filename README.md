# KupiMY to! — wspólna lista zakupów

Aplikacja mobilna (Expo, React Native) do wspólnej listy zakupów z trybem „W sklepie", synchronizacją w czasie rzeczywistym i powiadomieniami push. Projekt **kupiMY-to!**.

## Struktura

- **`app/`** — aplikacja Expo (TypeScript). Uruchomienie: `cd app && npm install && npm run start`. Konfiguracja: [app/README.md](app/README.md).
- **`supabase/`** — migracje bazy, Edge Functions (push). Opis i konfiguracja: [supabase/README.md](supabase/README.md).
- **`docs/`** — dokumentacja planu i wymagań.
- **`_bmad-output/`** — artefakty planowania i implementacji (PRD, epiki, story, sprint-status).

## Funkcje MVP

- Rejestracja i logowanie (Supabase Auth)
- Założenie gospodarstwa i zaproszenie przez kod
- Dołączenie do gospodarstwa po kodzie
- Wspólna lista: dodawanie, usuwanie, odhaczanie („Do kupienia" / „Kupione") z synchronizacją Realtime
- Tryb „W sklepie": countdown (2/3/5 min), blokada dopisywania dla pozostałych, odliczanie, „Zakończ zakupy"
- Powiadomienia push do domowników przy włączeniu „W sklepie" (wymaga konfiguracji FCM — patrz supabase/README.md)

Wszystkie usługi zewnętrzne w darmowych planach: [docs/third-party-free-tier.md](docs/third-party-free-tier.md).

## Przed pierwszym uruchomieniem

1. **Supabase:** załóż projekt w [Supabase Dashboard](https://supabase.com/dashboard), skopiuj URL i klucz anon do `app/.env` (z `app/.env.example`).
2. **Migracje:** w katalogu projektu Supabase wykonaj `supabase db push` (lub `supabase migration up`), żeby utworzyć tabele i RLS — [supabase/README.md](supabase/README.md).
3. **Aplikacja:** `cd app && npm install && cp .env.example .env` — uzupełnij `.env` i uruchom `npm run start`.

**Weryfikacja składni (bez uruchamiania aplikacji):** w katalogu głównym `npm run verify` (uruchamia TypeScript w `app/`).

## Weryfikacja (testy bojowe)

Scenariusze do ręcznego sprawdzenia z dwoma użytkownikami (dwa urządzenia lub emulator + urządzenie):

| # | Scenariusz | Oczekiwany rezultat |
|---|------------|---------------------|
| 1 | **Użytkownik A** zakłada gospodarstwo, kopiuje kod. **Użytkownik B** loguje się (lub rejestruje), wchodzi w „Mam kod zaproszenia", wkleja kod i dołącza. | B widzi tę samą listę co A (na razie pustą). |
| 2 | **A** dodaje pozycję „Mleko". | W ciągu kilku sekund **B** widzi „Mleko" w sekcji „Do kupienia". |
| 3 | **B** dodaje „Chleb", **A** odhacza „Mleko". | A widzi „Chleb" na liście i „Mleko" w „Kupione"; B widzi to samo. |
| 4 | **A** naciska „W sklepie", wybiera 3 min. | U A widać countdown. U **B** formularz dopisywania jest zablokowany, komunikat o zakupach w toku. (Push do B po skonfigurowaniu FCM.) |
| 5 | **A** naciska „Zakończ zakupy" przed upływem countdownu. | U B odblokowuje się dopisywanie, countdown znika. |
| 6 | **B** usuwa pozycję (Usuń, potwierdzenie). | Pozycja znika też u A. |

Po przejściu powyższych punktów synchronizację i tryb „W sklepie" uznaj za zweryfikowane.
