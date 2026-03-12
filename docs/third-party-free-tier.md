# Wymóg: usługi 3rd party za darmo

**Zasada projektu:** Wszystkie usługi zewnętrzne (third-party) używane w **KupiMY to!** (kupiMY-to!) muszą mieć **darmowy plan** wystarczający do MVP i normalnego użytku (bez obowiązkowej płatnej subskrypcji).

## Obecny stack i warstwy free

| Usługa | Rola w projekcie | Plan free / uwagi |
|--------|------------------|--------------------|
| **Expo** | Framework aplikacji, EAS Build (opcjonalnie) | Development: Expo Go za darmo. Buildy: Free plan (limit buildów w chmurze co miesiąc) lub **buildy lokalne** (`eas build --local`) bez limitu. |
| **Supabase** | Baza (PostgreSQL), Auth, Realtime, Edge Functions | Free tier: 500 MB DB, 50K MAU (Auth), 2 projekty, Realtime (200 połączeń, 100 msg/s). Wystarczy na MVP i małe gospodarstwa domowe. |
| **Firebase Cloud Messaging (FCM)** | Push „W sklepie” | **Bezpłatne** – nieograniczona liczba wiadomości, bez opłat za FCM. Firebase Spark (free) wystarczy. |

## Decyzje przy rozszerzaniu

- Przy dodawaniu nowej usługi 3rd party: **wymagany jest darmowy plan** pokrywający użycie w MVP.
- Jeśli jedyna opcja to usługa płatna – szukać alternatywy z free tierem lub udokumentować wyjątek i uzasadnienie.

*Ostatnia aktualizacja: 2026-03-11*
