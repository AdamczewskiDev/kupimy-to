/**
 * Kategorie zakupowe z przykładowymi produktami.
 * Źródła: typowe listy zakupów spożywczych (owoce i warzywa, nabiał, mięso, pieczywo, produkty suche, napoje, przyprawy, słodycze).
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
    products: ['Pomidory', 'Ogórki', 'Marchew', 'Jabłka', 'Banany'],
  },
  {
    id: 'nabial',
    name: 'Nabiał',
    icon: '🧀',
    products: ['Mleko', 'Ser żółty', 'Jogurt naturalny', 'Twaróg', 'Masło'],
  },
  {
    id: 'mieso-wedliny',
    name: 'Mięso i wędliny',
    icon: '🥩',
    products: ['Kurczak', 'Szynka', 'Kiełbasa', 'Wołowina', 'Indyk'],
  },
  {
    id: 'pieczywo',
    name: 'Pieczywo',
    icon: '🍞',
    products: ['Chleb', 'Bułki', 'Bagietka', 'Bułki do hot-dogów', 'Pieczywo tostowe'],
  },
  {
    id: 'produkty-suche',
    name: 'Produkty suche',
    icon: '🍚',
    products: ['Makaron', 'Ryż', 'Kasza gryczana', 'Mąka', 'Płatki owsiane'],
  },
  {
    id: 'napoje',
    name: 'Napoje',
    icon: '🥤',
    products: ['Woda mineralna', 'Sok owocowy', 'Kawa', 'Herbata', 'Napój gazowany'],
  },
  {
    id: 'przyprawy-sosy',
    name: 'Przyprawy i sosy',
    icon: '🧂',
    products: ['Sól', 'Olej', 'Ketchup', 'Musztarda', 'Sos sojowy'],
  },
  {
    id: 'slodycze-przekaski',
    name: 'Słodycze i przekąski',
    icon: '🍫',
    products: ['Czekolada', 'Ciastka', 'Chipsy', 'Orzechy', 'Batonik'],
  },
];
