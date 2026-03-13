/**
 * Kategorie zakupowe i produkty (wszystkie nazwy po polsku).
 * Zaktualizowano na podstawie składników z przepisów (WikiKuchnia PL, TheMealDB EN).
 */

export type ShoppingCategory = {
  id: string;
  name: string;
  icon: string;
  products: string[];
};

export const SHOPPING_CATEGORIES: ShoppingCategory[] = [
  {
    id: 'owoce-warzywa',
    name: 'Owoce i warzywa',
    icon: '🥬',
    products: [
      'Pomidory', 'Ogórki', 'Marchew', 'Jabłka', 'Banany', 'Cebula', 'Czosnek', 'Ziemniaki', 'Papryka',
      'Sałata', 'Szczypiorek', 'Seler', 'Pomarańcze', 'Morele', 'Cytryny', 'Limonka', 'Fasola', 'Kukurydza',
      'Kapusta', 'Cukinia', 'Szpinak', 'Rabarbar', 'Porzeczki', 'Buraki', 'Koperek', 'Pietruszka',
      'Fasolka szparagowa', 'Cebula czerwona', 'Kolendra', 'Mięta', 'Imbir', 'Papryczka chilli',
      'Dynia piżmowa', 'Grzyby shiitake',
    ],
  },
  {
    id: 'nabial',
    name: 'Nabiał',
    icon: '🧀',
    products: [
      'Mleko', 'Ser żółty', 'Jogurt naturalny', 'Twaróg', 'Masło', 'Śmietana', 'Jajka', 'Mleko zagęszczone',
      'Ser',
    ],
  },
  {
    id: 'mieso-wedliny',
    name: 'Mięso i wędliny',
    icon: '🥩',
    products: [
      'Kurczak', 'Szynka', 'Kiełbasa', 'Wołowina', 'Indyk', 'Łosoś', 'Piersi kurczaka',
      'Boczek', 'Mielona wołowina', 'Baranina', 'Koźlina',
    ],
  },
  {
    id: 'pieczywo',
    name: 'Pieczywo',
    icon: '🍞',
    products: [
      'Chleb', 'Bułki', 'Bagietka', 'Bułki do hot-dogów', 'Pieczywo tostowe', 'Tosty',
    ],
  },
  {
    id: 'produkty-suche',
    name: 'Produkty suche',
    icon: '🍚',
    products: [
      'Makaron', 'Ryż', 'Kasza gryczana', 'Mąka', 'Płatki owsiane', 'Spagetti', 'Makaron cannelloni',
      'Cukier', 'Proszek do pieczenia', 'Cukier waniliowy', 'Wafle', 'Soczewica',
      'Bułka tarta', 'Makaron udon', 'Makaron ryżowy', 'Mąka gryczana', 'Ryż jaśminowy', 'Fasola czerwona',
    ],
  },
  {
    id: 'napoje',
    name: 'Napoje',
    icon: '🥤',
    products: [
      'Woda mineralna', 'Sok owocowy', 'Kawa', 'Herbata', 'Napój gazowany', 'Woda', 'Wino białe',
      'Rum', 'Spirytus', 'Mirin', 'Bulion warzywny', 'Sos rybny', 'Ocet ryżowy',
    ],
  },
  {
    id: 'przyprawy-sosy',
    name: 'Przyprawy i sosy',
    icon: '🧂',
    products: [
      'Sól', 'Olej', 'Ketchup', 'Musztarda', 'Sos sojowy', 'Pieprz', 'Kminek', 'Curry', 'Papryka mielona',
      'Majonez', 'Ocet winny', 'Miód', 'Kostka bulionu warzywnego',
      'Oliwa z oliwek', 'Olej roślinny', 'Olej rzepakowy', 'Olej sezamowy',
      'Tymianek', 'Papryka cayenne', 'Płatki chilli', 'Sos worcestershire',
      'Cukier brązowy', 'Cukier puder', 'Syrop klonowy', 'Ziele angielskie', 'Czosnek granulowany',
    ],
  },
  {
    id: 'slodycze-przekaski',
    name: 'Słodycze i przekąski',
    icon: '🍫',
    products: [
      'Czekolada', 'Ciastka', 'Chipsy', 'Orzechy', 'Batonik', 'Herbatniki',
    ],
  },
];
