/**
 * Domyślna ilość i jednostki dla produktów z kategorii.
 * Jednostki: szt (sztuki), g/kg (gramy/kilogramy), ml/l (mililitry/litry).
 */

export type ProductUnitMode = 'szt' | 'g/kg' | 'ml/l';

export type ProductQuantityDefault = {
  defaultQuantity: number;
  defaultUnit: string;
  unitMode: ProductUnitMode;
};

/** Jednostki do pokazania dla danego trybu */
export const UNITS_BY_MODE: Record<ProductUnitMode, string[]> = {
  'szt': ['szt'],
  'g/kg': ['g', 'kg'],
  'ml/l': ['ml', 'l'],
};

/** Krok przy strzałce +/− w zależności od jednostki */
export function getStepForUnit(unit: string): number {
  switch (unit) {
    case 'kg':
      return 0.25;
    case 'l':
      return 0.5;
    case 'g':
      return 50;
    case 'ml':
      return 100;
    default:
      return 1;
  }
}

const DEFAULTS: Record<string, ProductQuantityDefault> = {
  // —— Owoce i warzywa ——
  'Pomidory': { defaultQuantity: 4, defaultUnit: 'szt', unitMode: 'szt' },
  'Ogórki': { defaultQuantity: 2, defaultUnit: 'szt', unitMode: 'szt' },
  'Marchew': { defaultQuantity: 3, defaultUnit: 'szt', unitMode: 'szt' },
  'Jabłka': { defaultQuantity: 6, defaultUnit: 'szt', unitMode: 'szt' },
  'Banany': { defaultQuantity: 4, defaultUnit: 'szt', unitMode: 'szt' },
  'Cebula': { defaultQuantity: 2, defaultUnit: 'szt', unitMode: 'szt' },
  'Czosnek': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Ziemniaki': { defaultQuantity: 6, defaultUnit: 'szt', unitMode: 'szt' },
  'Papryka': { defaultQuantity: 2, defaultUnit: 'szt', unitMode: 'szt' },
  'Sałata': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Szczypiorek': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Seler': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Pomarańcze': { defaultQuantity: 4, defaultUnit: 'szt', unitMode: 'szt' },
  'Morele': { defaultQuantity: 200, defaultUnit: 'g', unitMode: 'g/kg' },
  'Cytryny': { defaultQuantity: 2, defaultUnit: 'szt', unitMode: 'szt' },
  'Limonka': { defaultQuantity: 2, defaultUnit: 'szt', unitMode: 'szt' },
  'Fasola': { defaultQuantity: 400, defaultUnit: 'g', unitMode: 'g/kg' },
  'Kukurydza': { defaultQuantity: 340, defaultUnit: 'g', unitMode: 'g/kg' },
  'Kapusta': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Cukinia': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Szpinak': { defaultQuantity: 250, defaultUnit: 'g', unitMode: 'g/kg' },
  'Rabarbar': { defaultQuantity: 300, defaultUnit: 'g', unitMode: 'g/kg' },
  'Porzeczki': { defaultQuantity: 250, defaultUnit: 'g', unitMode: 'g/kg' },
  'Buraki': { defaultQuantity: 3, defaultUnit: 'szt', unitMode: 'szt' },
  'Koperek': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Pietruszka': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Fasolka szparagowa': { defaultQuantity: 300, defaultUnit: 'g', unitMode: 'g/kg' },
  'Cebula czerwona': { defaultQuantity: 2, defaultUnit: 'szt', unitMode: 'szt' },
  'Kolendra': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Mięta': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Imbir': { defaultQuantity: 50, defaultUnit: 'g', unitMode: 'g/kg' },
  'Papryczka chilli': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Dynia piżmowa': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Grzyby shiitake': { defaultQuantity: 200, defaultUnit: 'g', unitMode: 'g/kg' },

  // —— Nabiał (g/kg lub ml/l) ——
  'Mleko': { defaultQuantity: 1000, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Ser żółty': { defaultQuantity: 200, defaultUnit: 'g', unitMode: 'g/kg' },
  'Jogurt naturalny': { defaultQuantity: 2, defaultUnit: 'szt', unitMode: 'szt' },
  'Twaróg': { defaultQuantity: 250, defaultUnit: 'g', unitMode: 'g/kg' },
  'Masło': { defaultQuantity: 200, defaultUnit: 'g', unitMode: 'g/kg' },
  'Śmietana': { defaultQuantity: 200, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Jajka': { defaultQuantity: 6, defaultUnit: 'szt', unitMode: 'szt' },
  'Mleko zagęszczone': { defaultQuantity: 400, defaultUnit: 'g', unitMode: 'g/kg' },
  'Ser': { defaultQuantity: 200, defaultUnit: 'g', unitMode: 'g/kg' },

  // —— Mięso i wędliny (g/kg) ——
  'Kurczak': { defaultQuantity: 500, defaultUnit: 'g', unitMode: 'g/kg' },
  'Szynka': { defaultQuantity: 150, defaultUnit: 'g', unitMode: 'g/kg' },
  'Kiełbasa': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Wołowina': { defaultQuantity: 400, defaultUnit: 'g', unitMode: 'g/kg' },
  'Indyk': { defaultQuantity: 400, defaultUnit: 'g', unitMode: 'g/kg' },
  'Łosoś': { defaultQuantity: 300, defaultUnit: 'g', unitMode: 'g/kg' },
  'Piersi kurczaka': { defaultQuantity: 400, defaultUnit: 'g', unitMode: 'g/kg' },
  'Boczek': { defaultQuantity: 200, defaultUnit: 'g', unitMode: 'g/kg' },
  'Mielona wołowina': { defaultQuantity: 400, defaultUnit: 'g', unitMode: 'g/kg' },
  'Baranina': { defaultQuantity: 400, defaultUnit: 'g', unitMode: 'g/kg' },
  'Koźlina': { defaultQuantity: 400, defaultUnit: 'g', unitMode: 'g/kg' },

  // —— Pieczywo ——
  'Chleb': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Bułki': { defaultQuantity: 6, defaultUnit: 'szt', unitMode: 'szt' },
  'Bagietka': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Bułki do hot-dogów': { defaultQuantity: 4, defaultUnit: 'szt', unitMode: 'szt' },
  'Pieczywo tostowe': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Tosty': { defaultQuantity: 4, defaultUnit: 'szt', unitMode: 'szt' },

  // —— Produkty suche (g/kg) ——
  'Makaron': { defaultQuantity: 500, defaultUnit: 'g', unitMode: 'g/kg' },
  'Ryż': { defaultQuantity: 400, defaultUnit: 'g', unitMode: 'g/kg' },
  'Kasza gryczana': { defaultQuantity: 400, defaultUnit: 'g', unitMode: 'g/kg' },
  'Mąka': { defaultQuantity: 1, defaultUnit: 'kg', unitMode: 'g/kg' },
  'Płatki owsiane': { defaultQuantity: 500, defaultUnit: 'g', unitMode: 'g/kg' },
  'Spagetti': { defaultQuantity: 500, defaultUnit: 'g', unitMode: 'g/kg' },
  'Makaron cannelloni': { defaultQuantity: 250, defaultUnit: 'g', unitMode: 'g/kg' },
  'Cukier': { defaultQuantity: 1, defaultUnit: 'kg', unitMode: 'g/kg' },
  'Proszek do pieczenia': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Cukier waniliowy': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Wafle': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Soczewica': { defaultQuantity: 400, defaultUnit: 'g', unitMode: 'g/kg' },
  'Bułka tarta': { defaultQuantity: 200, defaultUnit: 'g', unitMode: 'g/kg' },
  'Makaron udon': { defaultQuantity: 250, defaultUnit: 'g', unitMode: 'g/kg' },
  'Makaron ryżowy': { defaultQuantity: 200, defaultUnit: 'g', unitMode: 'g/kg' },
  'Mąka gryczana': { defaultQuantity: 500, defaultUnit: 'g', unitMode: 'g/kg' },
  'Ryż jaśminowy': { defaultQuantity: 400, defaultUnit: 'g', unitMode: 'g/kg' },
  'Fasola czerwona': { defaultQuantity: 400, defaultUnit: 'g', unitMode: 'g/kg' },

  // —— Napoje (ml/l lub szt) ——
  'Woda mineralna': { defaultQuantity: 1500, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Sok owocowy': { defaultQuantity: 1000, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Kawa': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Herbata': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Napój gazowany': { defaultQuantity: 2000, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Woda': { defaultQuantity: 1000, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Wino białe': { defaultQuantity: 750, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Rum': { defaultQuantity: 700, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Spirytus': { defaultQuantity: 500, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Mirin': { defaultQuantity: 200, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Bulion warzywny': { defaultQuantity: 500, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Sos rybny': { defaultQuantity: 100, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Ocet ryżowy': { defaultQuantity: 100, defaultUnit: 'ml', unitMode: 'ml/l' },

  // —— Przyprawy i sosy (g/kg, ml/l lub szt) ——
  'Sól': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Olej': { defaultQuantity: 250, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Ketchup': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Musztarda': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Sos sojowy': { defaultQuantity: 100, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Pieprz': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Kminek': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Curry': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Papryka mielona': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Majonez': { defaultQuantity: 250, defaultUnit: 'g', unitMode: 'g/kg' },
  'Ocet winny': { defaultQuantity: 250, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Miód': { defaultQuantity: 500, defaultUnit: 'g', unitMode: 'g/kg' },
  'Kostka bulionu warzywnego': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Oliwa z oliwek': { defaultQuantity: 250, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Olej roślinny': { defaultQuantity: 500, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Olej rzepakowy': { defaultQuantity: 500, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Olej sezamowy': { defaultQuantity: 100, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Tymianek': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Papryka cayenne': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Płatki chilli': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Sos worcestershire': { defaultQuantity: 150, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Cukier brązowy': { defaultQuantity: 500, defaultUnit: 'g', unitMode: 'g/kg' },
  'Cukier puder': { defaultQuantity: 250, defaultUnit: 'g', unitMode: 'g/kg' },
  'Syrop klonowy': { defaultQuantity: 250, defaultUnit: 'ml', unitMode: 'ml/l' },
  'Ziele angielskie': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Czosnek granulowany': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },

  // —— Słodycze i przekąski ——
  'Czekolada': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Ciastka': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Chipsy': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Orzechy': { defaultQuantity: 200, defaultUnit: 'g', unitMode: 'g/kg' },
  'Batonik': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
  'Herbatniki': { defaultQuantity: 1, defaultUnit: 'szt', unitMode: 'szt' },
};

export function getProductQuantityDefault(productLabel: string): ProductQuantityDefault {
  return (
    DEFAULTS[productLabel] ?? {
      defaultQuantity: 1,
      defaultUnit: 'szt',
      unitMode: 'szt',
    }
  );
}
