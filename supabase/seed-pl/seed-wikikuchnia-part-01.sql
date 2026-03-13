-- Przepisy z WikiKuchnia.org (https://www.wikikuchnia.org/) – za zgodą.
-- Wygenerowano: 2026-03-13T13:13:21.499Z
-- Jednostki: g, ml, l, kg, szt, opak.

DELETE FROM recipe_steps WHERE recipe_id IN (SELECT id FROM recipes WHERE description LIKE '%WikiKuchnia%');
DELETE FROM recipe_ingredients WHERE recipe_id IN (SELECT id FROM recipes WHERE description LIKE '%WikiKuchnia%');
DELETE FROM recipes WHERE description LIKE '%WikiKuchnia%';
INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-c2e8c7860b07', 'Babka drożdżowa parzona', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-c2e8c7860b07', '50 dag mąki (2,5 szklanki)', 10000, 'g', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-c2e8c7860b07', 'dag margaryny', 13, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-c2e8c7860b07', 'dag cukru (8 łyżek)', 15, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-c2e8c7860b07', '5 żółtek', 1, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-c2e8c7860b07', 'dag drożdży', 6, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-c2e8c7860b07', 'szklanka mleka', 200, 'g', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-c2e8c7860b07', 'cukier waniliowy lub esencja zapachowa', 1, 'szt', 7);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-c2e8c7860b07', 'tłuszcz do formy', 1, 'szt', 8);

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-85fea52fadc5', 'Blok czekoladowy', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-85fea52fadc5', 'mleka w proszku,', 1, 'opak', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-85fea52fadc5', 'cukier waniliowy,', 1, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-85fea52fadc5', 'cukru,', 200, 'g', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-85fea52fadc5', 'czubate łyżki kakao,', 3, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-85fea52fadc5', 'masła,', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-85fea52fadc5', '1/2 szklanki orzechów włoskich,', 200, 'g', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-85fea52fadc5', '1/2 szklanki rodzynek,', 200, 'g', 7);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-85fea52fadc5', 'paczki herbatników,', 2, 'szt', 8);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-85fea52fadc5', '1/2 szklanki wody.', 200, 'g', 9);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-85fea52fadc5', 1, 'Czas przygotowania: 30 min, Ilość porcji: 8, Orientacyjny koszt: 20 zł.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-ae2a05608f92', 'Ciasteczka cebulowe', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-ae2a05608f92', 'czubata szklanka mąki,', 200, 'g', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-ae2a05608f92', 'dag masła,', 10, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-ae2a05608f92', 'żółtko,', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-ae2a05608f92', '3 łyżki gęstej śmietany,', 3, 'g', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-ae2a05608f92', 'łyżeczka proszku do pieczenia,', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-ae2a05608f92', 'cebule średniej wielkości,', 2, 'szt', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-ae2a05608f92', 'dag maku,', 5, 'szt', 7);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-ae2a05608f92', 'sól.', 1, 'l', 8);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-ae2a05608f92', 1, 'Ilość porcji: 6, Kaloryczność: 252 kcal (jedna procja),');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-e38749b0c672', 'Ciasteczka nadziewane żółtym serem', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-e38749b0c672', 'mąki,', 400, 'g', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-e38749b0c672', 'dag masła,', 25, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-e38749b0c672', '2 żółtka,', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-e38749b0c672', '¾ szklanki gęstej śmietany,', 1, 'g', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-e38749b0c672', 'płaska łyżeczka soli.', 1, 'szt', 5);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-e38749b0c672', 1, 'Ilość porcji: 8, Kaloryczność: 468 kcal (jedna porcja).');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-c3c6d4308432', 'Ciasteczka ptysiowe z serem', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-c3c6d4308432', 'szklanka mąki,', 200, 'g', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-c3c6d4308432', 'półtorej szklanki wody,', 200, 'g', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-c3c6d4308432', 'dag masła,', 15, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-c3c6d4308432', 'dag sera gruyère,', 8, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-c3c6d4308432', 'jaj,', 5, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-c3c6d4308432', 'pół łyżeczki mielonej słodkiej papryki,', 1, 'szt', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-c3c6d4308432', 'szczypta soli.', 1, 'szt', 7);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-c3c6d4308432', 1, 'Ilość porcji: 10, Kaloryczność: 196 kcal (jedna porcja).');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-928857dffa59', 'Ciasteczka sezamowe', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-928857dffa59', 'półtorej szklanki mąki,', 200, 'g', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-928857dffa59', '4 łyżki oleju słonecznikowego,', 1, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-928857dffa59', 'jaja,', 2, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-928857dffa59', '4 łyżki gęstej śmietany,', 4, 'g', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-928857dffa59', 'dag sezamu,', 15, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-928857dffa59', 'łyżeczka proszku do pieczenia,', 1, 'szt', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-928857dffa59', 'sól.', 1, 'l', 7);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-928857dffa59', 1, 'Ilość porcji: 6, Kaloryczność: 333 kcal (jedna porcja).');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-cca658e22174', 'Czeko-Jajecznica', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-cca658e22174', '1 Jajko', 1, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-cca658e22174', 'stołowe łyżki mąki', 2, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-cca658e22174', '2-3 stołowe łyżki kakao', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-cca658e22174', '1 łyżeczka cukru', 1, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-cca658e22174', 'Sczypta proszku do pieczenia', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-cca658e22174', 'Olej do smażenia', 1, 'szt', 6);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-cca658e22174', 1, 'Czas przygotowania: - 30 min Ilość porcji: -1');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-d8eec4092d0d', 'Czekoladowe fondue', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d8eec4092d0d', 'dag pokrojonej czekolady deserowej,', 20, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d8eec4092d0d', '¼ szklanki śmietany (36%),', 7200, 'g', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d8eec4092d0d', 'słoik (ok. 20 dag) wiśni koktajlowych (mogą być wiśnie z nalewki),', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d8eec4092d0d', '1 puszka (ok. 900 g) gruszek w syropie,', 900, 'g', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d8eec4092d0d', '40-50 dag biszkopcików lub pokrojonego w kostkę podeschniętego domowego biszkoptu.', 1, 'szt', 5);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-d8eec4092d0d', 1, '20 dag pokrojonej czekolady deserowej, ¼ szklanki śmietany (36%), 1 słoik (ok. 20 dag) wiśni koktajlowych (mogą być wiśnie z nalewki), 1 puszka (ok. 900 g) gruszek w syropie, 40-50 dag biszkopcików lub pokrojonego w kostkę podeschniętego domowego biszkoptu.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-d75332cdc534', 'Czekoladowy serniczek z tofu', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d75332cdc534', 'mąki pszennej', 100, 'g', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d75332cdc534', 'migdałów, zmielonych', 100, 'g', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d75332cdc534', 'brązowego cukru demerara (kryształ)', 200, 'g', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d75332cdc534', 'margaryny wegetaraNskiej', 150, 'g', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d75332cdc534', 'tofu (ser)', 675, 'g', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d75332cdc534', 'oleju roślinnego', 175, 'ml', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d75332cdc534', 'soku z pomarańczy', 125, 'ml', 7);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d75332cdc534', 'brandy', 175, 'ml', 8);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d75332cdc534', 'kakao i dodatkowa ilość do dekoracji', 50, 'g', 9);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d75332cdc534', '2 łyżeczki aromatu migdałowego', 1, 'szt', 10);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d75332cdc534', 'cukier puder', 1, 'szt', 11);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-d75332cdc534', 'owoce miechunki jadalnej, do dekoracji', 1, 'szt', 12);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-d75332cdc534', 1, 'Czas przygotowania: - min, Ilość porcji: -12 kawałków, Kaloryczność: -, Orientacyjny koszt: - zł.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-f64ea58f50f7', 'Figowe polędwiczki wieprzowe', 'Źródło: WikiKuchnia.org', 'lunch', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-f64ea58f50f7', 'dwie polędwiczki wieprzowe', 1, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-f64ea58f50f7', 'sześć fig świeżych lub dziesięć suszonych', 1, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-f64ea58f50f7', 'szklanka śmietanki kremówki', 200, 'g', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-f64ea58f50f7', 'łyżeczka tymianku', 1, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-f64ea58f50f7', 'łyżeczka rozmarynu', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-f64ea58f50f7', 'sól', 1, 'l', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-f64ea58f50f7', 'pieprz', 1, 'szt', 7);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-f64ea58f50f7', 'niewielka czerwona cebula', 1, 'szt', 8);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-f64ea58f50f7', 'dwie łyżki mąki', 1, 'szt', 9);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-f64ea58f50f7', 'łyżeczka słodkiej papryki', 1, 'szt', 10);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-f64ea58f50f7', 'olej', 1, 'szt', 11);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-f64ea58f50f7', 1, 'Czas przygotowania: 50 min Ilość porcji: 4 Kaloryczność: - Orientacyjny koszt: - zł');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-3b933380262e', 'Galaretkowiec', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3b933380262e', 'śmietany słodko-kwaśnej (18%)', 500, 'ml', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3b933380262e', 'mleka', 500, 'ml', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3b933380262e', '1/2 szklanki cukru', 200, 'g', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3b933380262e', '3 łyżki żelatyny', 1, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3b933380262e', 'cukry waniliowe', 2, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3b933380262e', 'galaretki, różne smaki (kolory)', 3, 'szt', 6);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-3b933380262e', 1, 'Czas przygotowania: - min, Ilość porcji: - kawałków, Kaloryczność: -, Orientacyjny koszt: - zł.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-123f2d3bf4c3', 'Gulasz', 'Źródło: WikiKuchnia.org', 'lunch', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-123f2d3bf4c3', 'karkówki,', 1, 'kg', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-123f2d3bf4c3', 'duże papryki czerwone,', 2, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-123f2d3bf4c3', 'duże papryki żółte,', 2, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-123f2d3bf4c3', 'duże cebule,', 4, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-123f2d3bf4c3', 'pieczarek,', 1, 'kg', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-123f2d3bf4c3', 'ziemniaków,', 0.5, 'kg', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-123f2d3bf4c3', 'przecieru pomidorowego,', 400, 'g', 7);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-123f2d3bf4c3', '5 ząbków czosnku,', 5, 'szt', 8);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-123f2d3bf4c3', '2 łyżki sosu sojowego,', 1, 'szt', 9);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-123f2d3bf4c3', 'oliwa z oliwek,', 1, 'szt', 10);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-123f2d3bf4c3', 'przyprawy: curry, papryka chili, pieprz, sól, koperek.', 1, 'l', 11);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-123f2d3bf4c3', 1, 'Czas przygotowania: (w całości) ok 250 min, Ilość porcji: na 4 osoby.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-e3b27f9293f1', 'Jabłuszko pełne snu', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-e3b27f9293f1', '4 jajka', 4, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-e3b27f9293f1', 'cukru', 200, 'g', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-e3b27f9293f1', 'mąki', 400, 'g', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-e3b27f9293f1', '2/3 szklanki oleju', 400, 'g', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-e3b27f9293f1', 'orzechów włoskich, grubo posiekanych', 200, 'g', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-e3b27f9293f1', '1 łyżeczka sody', 1, 'szt', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-e3b27f9293f1', '1 łyżeczka cynamonu', 1, 'szt', 7);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-e3b27f9293f1', '1 łyżeczka proszku do pieczenia', 1, 'szt', 8);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-e3b27f9293f1', '4-5 jabłek', 1, 'szt', 9);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-e3b27f9293f1', 1, 'Czas przygotowania: - min, Ilość porcji: -, Kaloryczność: -, Orientacyjny koszt: - zł.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-dffc0060ce78', 'Kalafior po włosku', 'Źródło: WikiKuchnia.org', 'lunch', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-dffc0060ce78', 'duże kalafiory,', 2, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-dffc0060ce78', 'sól,', 1, 'l', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-dffc0060ce78', 'cukier,', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-dffc0060ce78', '2 łyżki tartego żółtego sera,', 1, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-dffc0060ce78', 'dag szynki,', 8, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-dffc0060ce78', 'dag pieczarek,', 15, 'szt', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-dffc0060ce78', '1 łyżka masła,', 1, 'szt', 7);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-dffc0060ce78', 'ketchup.', 1, 'szt', 8);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-dffc0060ce78', 1, '2 duże kalafiory, sól, cukier, 2 łyżki tartego żółtego sera, 8 dag szynki, 15 dag pieczarek, 1 łyżka masła, ketchup.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-a3a3c69d2992', 'Kompot z rabarbaru', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a3a3c69d2992', '5 łodyg rabarbaru niezbyt grubych,', 1, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a3a3c69d2992', 'cukru,', 200, 'g', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a3a3c69d2992', 'skórka z jednej cytryny.', 1, 'szt', 3);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-a3a3c69d2992', 1, 'Czas przygotowania: - min, Ilość porcji: -, Kaloryczność: -, Orientacyjny koszt: - zł.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-3037e88f250f', 'Krokiety serowe', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3037e88f250f', 'szklanka mąki,', 200, 'g', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3037e88f250f', 'szklanka mleka,', 200, 'g', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3037e88f250f', 'dag masła,', 8, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3037e88f250f', 'dag startego żółtego sera,', 15, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3037e88f250f', '2 żółtka,', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3037e88f250f', 'sól,', 1, 'l', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3037e88f250f', 'pieprz,', 1, 'szt', 7);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3037e88f250f', 'mielona ostra papryka,', 1, 'szt', 8);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3037e88f250f', 'bułka tarta,', 1, 'szt', 9);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-3037e88f250f', 'olej do smażenia.', 1, 'szt', 10);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-3037e88f250f', 1, 'Ilość porcji: 6, Kaloryczność: 312 (jedna porcja).');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-a47d4ed9c312', 'Kulki z Herbatników', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a47d4ed9c312', 'paczki herbatników (po 50g),', 2, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a47d4ed9c312', '0.5 kostki masła,', 0.5, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a47d4ed9c312', '3 łyżki cukru pudru,', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a47d4ed9c312', '3 łyżki kakao,', 1, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a47d4ed9c312', '3 łyżki spirytusu.', 1, 'szt', 5);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-a47d4ed9c312', 1, '2 paczki herbatników (po 50g), 0.5 kostki masła, 3 łyżki cukru pudru, 3 łyżki kakao, 3 łyżki spirytusu.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-2e1c5b080e5a', 'Kurczak w białym winie', 'Źródło: WikiKuchnia.org', 'lunch', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-2e1c5b080e5a', '6 nóg z kurczaka,', 6, 'g', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-2e1c5b080e5a', 'białego wytrawnego wina,', 250, 'ml', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-2e1c5b080e5a', 'piórka czosnku,', 2, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-2e1c5b080e5a', '2 średnie cebule,', 1, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-2e1c5b080e5a', 'przyprawy: sól, jarzynka, oregano, curry, pieprz, papryka.', 1, 'l', 5);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-2e1c5b080e5a', 1, 'Czas przygotowania: 80 min, Ilość porcji: 6, Kaloryczność: średnia, Orientacyjny koszt: 20 zł.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-8bddf5a0fbe1', 'Kurczak w winie', 'Źródło: WikiKuchnia.org', 'lunch', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8bddf5a0fbe1', 'kurczak', 1, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8bddf5a0fbe1', 'chudego boczku', 300, 'g', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8bddf5a0fbe1', 'niewielkich cebulek', 20, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8bddf5a0fbe1', 'pieczarek', 250, 'g', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8bddf5a0fbe1', 'butelka wytrawnego, czerwonego wina', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8bddf5a0fbe1', 'masła', 100, 'g', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8bddf5a0fbe1', 'kieliszek oliwy', 1, 'szt', 7);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8bddf5a0fbe1', 'dwa ząbki czosnku', 2, 'szt', 8);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8bddf5a0fbe1', 'mąki pszennej', 30, 'g', 9);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8bddf5a0fbe1', 'tymianek', 1, 'szt', 10);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8bddf5a0fbe1', 'liść laurowy', 1, 'szt', 11);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8bddf5a0fbe1', 'sól', 1, 'l', 12);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-8bddf5a0fbe1', 1, 'Czas przygotowania: 45 min Ilość porcji: 6 Kaloryczność: - Orientacyjny koszt: - zł');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-73efd26da8fc', 'Lemoniada porzeczkowa', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-73efd26da8fc', 'czerwonych lub czarnych porzeczek', 1, 'kg', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-73efd26da8fc', '(szklanka) cukru', 0.25, 'l', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-73efd26da8fc', 'cytryna', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-73efd26da8fc', 'tonik lub woda mineralna', 1, 'szt', 4);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-73efd26da8fc', 1, 'Czas przygotowania: - średni Ilość porcji: - duża Kaloryczność: - niska Orientacyjny koszt: - niski');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-318a1803250c', 'Marchwiak', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-318a1803250c', 'mąki', 0.75, 'kg', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-318a1803250c', '2 szt. jajek', 2, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-318a1803250c', 'szkl. cukru', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-318a1803250c', '1,5 szkl. mleka', 1, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-318a1803250c', 'amoniak', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-318a1803250c', '350-400g Marchwi', 1, 'szt', 6);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-318a1803250c', 1, 'Czas przygotowania: - ok. 45 min, Ilość porcji: dużo , Kaloryczność: - niska, Orientacyjny koszt: - niski zł.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-977653b0d810', 'Migdałowa szarlotka', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-977653b0d810', 'jabłek', 1.5, 'kg', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-977653b0d810', '25 dag mąki (1,5 szklanki,', 5000, 'g', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-977653b0d810', 'cytryna,', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-977653b0d810', 'dag cukru,', 20, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-977653b0d810', 'jugurtu naturalnego,', 200, 'ml', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-977653b0d810', '¾ szklanki oleju,', 200, 'g', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-977653b0d810', '3 jajka,', 3, 'szt', 7);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-977653b0d810', '1 łyżka proszku do pieczenia,', 1, 'szt', 8);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-977653b0d810', 'cukru waniliowego,', 1, 'opak', 9);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-977653b0d810', 'dag płatków migdałowych,', 5, 'szt', 10);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-977653b0d810', 'cukier puder.', 1, 'szt', 11);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-977653b0d810', 1, '1,5 kg jabłek 25 dag mąki (1,5 szklanki, 1 cytryna, 20 dag cukru, 200 ml jugurtu naturalnego, ¾ szklanki oleju, 3 jajka, 1 łyżka proszku do pieczenia, 1 opakowanie cukru waniliowego, 5 dag płatków migdałowych, cukier puder.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-20f1deaa382b', 'Murzynek', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-20f1deaa382b', 'kostka masła,', 1, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-20f1deaa382b', 'cukru,', 300, 'g', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-20f1deaa382b', '4 łyżki kakao,', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-20f1deaa382b', 'mleka,', 100, 'g', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-20f1deaa382b', '4 jajka,', 4, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-20f1deaa382b', 'mąki,', 400, 'g', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-20f1deaa382b', '1 łyżeczka proszku do pieczenia,', 1, 'szt', 7);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-20f1deaa382b', 'bakalie,', 1, 'szt', 8);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-20f1deaa382b', 1, 'Czas przygotowania: 20 min, Ilość porcji: zależy jak się pokroi, Kaloryczność: nie ważna, ważny jest tylko niebiański smak, Orientacyjny koszt: -.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-2f08bb7e9f95', 'Obwarzanki z kminkiem', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-2f08bb7e9f95', 'mąki,', 600, 'g', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-2f08bb7e9f95', 'dag drożdży,', 3, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-2f08bb7e9f95', 'letniej wody,', 100, 'g', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-2f08bb7e9f95', 'sól,', 1, 'l', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-2f08bb7e9f95', 'kminek.', 1, 'szt', 5);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-2f08bb7e9f95', 1, 'Ilość porcji: 6, Kaloryczność: 210 kcal (jedna porcja).');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-a8c218ffe905', 'Placek amerykański', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a8c218ffe905', 'jaj,', 5, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a8c218ffe905', 'cukru,', 400, 'g', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a8c218ffe905', 'oleju,', 300, 'g', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a8c218ffe905', '2 łyżeczki cynamonu,', 1, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a8c218ffe905', '2 łyżeczki sody oczyszczonej,', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a8c218ffe905', 'grść rodzynek,', 1, 'szt', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a8c218ffe905', 'garść orzechów,', 1, 'szt', 7);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a8c218ffe905', 'jabłek.', 2, 'kg', 8);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-a8c218ffe905', 1, '5 jaj, 2 szklanki cukru, 1,5 szklanki oleju, 2 łyżeczki cynamonu, 2 łyżeczki sody oczyszczonej, grść rodzynek, garść orzechów, 2 kg jabłek.');
