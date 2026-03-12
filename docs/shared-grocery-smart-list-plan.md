# Shared Grocery Smart-List — plan wdrożenia

Dokumentacja pomysłu i planu wdrożenia aplikacji **„Shared Grocery Smart-List” (Lista, która zna Twój dom)** — wspólna lista zakupów dla domowników z „pamięcią” i trybem „Idę do sklepu”.

---

## Wizja i problem

**Problem:** Kupujesz mleko, a okazuje się, że partner kupił je godzinę wcześniej.

**Rozwiązanie:** Wspólna lista zakupów z synchronizacją na żywo i funkcją **„Idę do sklepu”** — klikasz przycisk, reszta domowników dostaje powiadomienie: *„Masz 5 minut na dodanie czegoś do listy, zanim zamknę zakupy”*.

---

## ETAP 1: MVP (Minimum Viable Product)

Nie buduj od razu kombajnu. Skup się na tym, aby **dwie osoby mogły widzieć tę samą listę w czasie rzeczywistym**.

| Element | Opis |
|--------|------|
| **Synchronizacja Live** | Serce apki. Gdy ja dopisuję „mleko”, u Ciebie pojawia się ono sekundę później bez odświeżania strony (np. Firebase lub Supabase). |
| **Status „W sklepie”** | Wielki przycisk na górze. Po kliknięciu lista blokuje się dla innych (lub wyświetla ostrzeżenie), a domownicy dostają powiadomienie: *„Kuba jest w Lidlu! Masz 2 minuty na dopisanie czegoś!”*. |
| **Proste odhaczanie** | Klik w produkt → trafia do sekcji „Kupione”. |

---

## ETAP 2: Funkcje „Smart” (wyróżnik produktu)

Gdy baza działa, dodaj funkcje, które sprawią, że ludzie nie wrócą do zwykłego Notatnika:

| Funkcja | Opis |
|---------|------|
| **Pamięć zakupowa (Sugerowanie)** | Apka uczy się, że co sobotę kupujecie jajka. Jeśli jest piątek wieczorem, a jajek nie ma na liście, apka wysyła powiadomienie: *„Zazwyczaj kupujecie jajka w sobotę. Dodać je?”*. |
| **Sortowanie po alejkach** | Produkty automatycznie grupują się w sekcje: Warzywa, Nabiał, Chemia. Dzięki temu nie biegasz po sklepie tam i z powrotem. |
| **Zdjęcie konkretnego produktu** | Jeśli partnerka chce „ten konkretny jogurt, a nie inny”, może dołączyć zdjęcie opakowania do pozycji na liście. |

---

## ETAP 3: Stack technologiczny (propozycja)

Szybkie i solidne wdrożenie:

| Warstwa | Technologia | Uzasadnienie |
|---------|-------------|--------------|
| **Frontend** | React Native lub Flutter | Jedna codebase na Androida i iOS. |
| **Backend / Baza** | Supabase | Łatwa konfiguracja bazy czasu rzeczywistego i logowania. |
| **Powiadomienia** | Firebase Cloud Messaging | Alerty „Jestem w sklepie” (push). |

---

## ETAP 4: Plan działania (krok po kroku)

| Tydzień | Zakres |
|---------|--------|
| **Tydzień 1** | Logika bazy. System „Gospodarstwo domowe” + zaproszenie drugiej osoby (kod/link). |
| **Tydzień 2** | Interfejs listy. Czytelny widok dodawania i usuwania. Swipe-to-delete. |
| **Tydzień 3** | System powiadomień. Przycisk „Idę na zakupy” + push dla grupy. |
| **Tydzień 4** | Testy bojowe. Dwie osoby, dwa sklepy — weryfikacja synchronizacji. |

---

## ETAP 5: Rozwój / monetyzacja (później)

- **Integracja z e-sklepami:** przycisk *„Zamów te braki do domu przez InPost/Glovo”*.
- **Wspólny portfel:** wpisanie ceny po zakupie → na koniec miesiąca: *„Wydaliście 1200 zł na jedzenie, z czego 200 zł na słodycze”*.

---

## Pierwsze zadanie (przed implementacją)

- Zastanowić się nad **nazwą** produktu.
- Zrobić **prosty szkic** (nawet na kartce) ekranu głównego.
- (Opcjonalnie) Zaprojektować **strukturę bazy danych** dla „Gospodarstwa domowego”.

---

*Dokument dodany do projektu w ramach procesu BMAD. Data: 2026-03-11.*
