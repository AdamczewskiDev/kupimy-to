# Przepisy TheMealDB (EN)

- **seed-themealdb-part-01.sql**, **part-02.sql**, … – generowane bezpośrednio przez skrypt (po 25 przepisów na plik).
- Jednostki: **g**, **ml**, **l**, **kg**, **szt**, **opak** (parsowane z API, pod kalkulację kalorii).

**Generowanie:** `node scripts/fetch-themealdb.js` (z katalogu głównego projektu).  
Opcjonalnie limit: `node scripts/fetch-themealdb.js 100`
