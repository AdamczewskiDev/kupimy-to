/**
 * Minuty na dopisanie do listy po „Za chwilę idę na zakupy!” (countdown w app i treść push).
 * Źródło prawdy: przy zmianie zaktualizuj też WARNING_MINUTES w supabase/functions/send-shopping-warning-push/index.ts.
 */
export const WARNING_COUNTDOWN_MINUTES = 15;

/** Minuty sesji „W sklepie” po zakończeniu countdownu „Za chwilę idę”. */
export const AUTO_IN_STORE_MINUTES = 25;

/** Maksymalna długość kodu zaproszenia (UI + zalecane w backendzie). */
export const INVITE_CODE_MAX_LENGTH = 12;

/** Jednostki przy pozycjach listy (zgodne z CHECK w list_items.unit). */
export const LIST_ITEM_UNITS = ['szt', 'kg', 'g', 'l', 'ml', 'opak'] as const;
export type ListItemUnit = (typeof LIST_ITEM_UNITS)[number];
export const DEFAULT_LIST_ITEM_UNIT: ListItemUnit = 'szt';
