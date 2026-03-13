INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-99ec94b71c87', 'Placek morelowy', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-99ec94b71c87', 'niesolonego masła', 200, 'g', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-99ec94b71c87', 'cztery żółtka', 1, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-99ec94b71c87', 'cukru', 200, 'g', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-99ec94b71c87', 'gra, mąki', 200, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-99ec94b71c87', 'cztery białka', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-99ec94b71c87', 'dziesięć wydrylowanych moreli', 1, 'szt', 6);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-99ec94b71c87', 1, '200 gram niesolonego masła cztery żółtka 200 gram cukru 200 gra, mąki cztery białka dziesięć wydrylowanych moreli');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-a369e4148c67', 'Przekąski jarskie', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', 'duże ziemniaki do pieczenia', 1, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', '2 łyżki oleju roślinnego', 1, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', '4 łyżeczki soli', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', 'kwaśnej śmietany', 150, 'ml', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', '2 łyżki szczypiorku, posiekanego (do dekoracji)', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', 'kiełków fasoli', 50, 'g', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', '1 łodyga selera naciowego, pokrojona w plasterki', 1, 'szt', 7);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', 'pomarańcza, obrana ze skórki i podzielona na cząstki', 1, 'szt', 8);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', 'słodkie, czerwona jabłko', 1, 'szt', 9);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', '1/2 łyżka jasnego sosu sojowego', 1, 'szt', 10);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', '1 łyżka płynnego miodu', 1, 'szt', 11);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', '1 mały ząbek czosnku, zmiażdżony', 1, 'szt', 12);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', 'mieszanej fasoli, z puszki, po odcedzeniu', 100, 'g', 13);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', 'cebula, przepołowiona i pokrojona w plasterki', 1, 'szt', 14);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', 'pomidor, posiekany', 1, 'szt', 15);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', 'cebulki szalotki, posiekane', 2, 'szt', 16);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', '1 łyżeczki soku z cytryny', 1, 'szt', 17);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a369e4148c67', 'sól i pieprz', 1, 'l', 18);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-a369e4148c67', 1, 'Czas przygotowania: - min, Ilość porcji: -4, Kaloryczność: -, Orientacyjny koszt: - zł.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-cf55f8dfaff5', 'Ptysie', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-cf55f8dfaff5', '12½ dag dokładnie przesianej mąki,', 1, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-cf55f8dfaff5', '1 łyżka cukru,', 1, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-cf55f8dfaff5', '12½ dag masła,', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-cf55f8dfaff5', 'jaja,', 3, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-cf55f8dfaff5', '¼ litra wody,', 1, 'l', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-cf55f8dfaff5', '1 łyżeczka proszku do pieczenia,', 1, 'szt', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-cf55f8dfaff5', '1 łyżeczka cukru waniliowego.', 1, 'szt', 7);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-cf55f8dfaff5', 1, '12½ dag dokładnie przesianej mąki, 1 łyżka cukru, 12½ dag masła, 3 jaja, ¼ litra wody, 1 łyżeczka proszku do pieczenia, 1 łyżeczka cukru waniliowego.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-6a0eb7e53aad', 'Róże karnawałowe', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-6a0eb7e53aad', 'dag mąki,', 25, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-6a0eb7e53aad', '+ 2 żółtka (białka z dwóch jaj i żółtka z czterech jaj),', 2, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-6a0eb7e53aad', 'dag cukru,', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-6a0eb7e53aad', 'dag masła,', 2, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-6a0eb7e53aad', 'płaska łyżeczka proszku do pieczenia,', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-6a0eb7e53aad', '1 łyżka rumu lub spirytusu .', 1, 'szt', 6);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-6a0eb7e53aad', 1, 'Czas przygotowania: &#160;? min, Ilość porcji: &#160;?, Orientacyjny koszt: &#160;? zł.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-96eff91c218d', 'Ryba w papierku', 'Źródło: WikiKuchnia.org', 'lunch', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-96eff91c218d', 'świeżego łososia,', 1, 'kg', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-96eff91c218d', '5-6 szt. ziemniaków,', 5, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-96eff91c218d', 'przyprawy do smaku,', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-96eff91c218d', 'świeży koperek według uznania,', 1, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-96eff91c218d', 'folia aluminiowa lub pergamin do pieczenia.', 1, 'szt', 5);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-96eff91c218d', 1, 'Czas przygotowania: - 25 min, Ilość porcji: - 8,oo - 10,oo Kaloryczność: - ok. 300kcal/100g, Orientacyjny koszt: - ok. 26zł/1kg ryby + 2 zł ziemniaki, przyprawy.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-f544afa5267a', 'Sałatka buraczana z kukurydzą', 'Źródło: WikiKuchnia.org', 'lunch', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-f544afa5267a', 'Sałaty', 1, 'szt', 1);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-f544afa5267a', 1, '30 dag buraków 30 dag ziemniaków 1 czerwona cebula 6 - 8 korniszonów po 2 łyżki posiekanego szczypiorku i natki pietruszki 1 puszka kukurydzy Na sos: [ edytuj ] 5 łyżek oliwy 2 łyżki zalewy z korniszonów 2 łyżki sosu sojowego 4 łyżki soku jabłkowego 1 łyżeczka bulionu warzywnego rozpuszczona w 2 łyżkach wody zioła sałatkowe sól, pieprz');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-76cdce39fd4b', 'Sałatka z kurczaka z curry', 'Źródło: WikiKuchnia.org', 'lunch', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-76cdce39fd4b', '1,5 piersi kurczaka,', 1, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-76cdce39fd4b', '2-3 puszki kukurydzy', 1, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-76cdce39fd4b', 'puszka ananasa', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-76cdce39fd4b', 'sera żółtego (wedle upodobań)', 0.5, 'kg', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-76cdce39fd4b', 'majonez', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-76cdce39fd4b', 'curry (dużo)', 1, 'szt', 6);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-76cdce39fd4b', 1, 'Czas przygotowania: 35 min, Orientacyjny koszt: - zł.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-98d049118d0e', 'Sałatka ziemniaczana', 'Źródło: WikiKuchnia.org', 'lunch', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-98d049118d0e', 'ziemniaków,', 6, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-98d049118d0e', '2 - 3 łyżki oleju,', 1, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-98d049118d0e', 'łyżeczka zmielonego kminku,', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-98d049118d0e', 'sól.', 1, 'l', 4);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-98d049118d0e', 1, 'Rodzaj sałatki (mieszanki), której głównym składnikiem są ziemniaki. W większości podawanych sałatek ziemniaczanych występują ziemniaki gotowane w wodzie, ale równie dobrze można tworzyć sałatki z ziemniaków pieczonych w mundurkach, lub podsmażanych. Sałatki ziemniaczane znane są praktycznie na całym starym kontynencie, a dodatkami mogą być zarówno różne rodzaje mięs, ryb, warzyw, grzybów, orzechów jak również owoców. Sałatki ziemniaczane mogą być podawane na zimno jak również na ciepło.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-a03520dca1e2', 'Serowe ślimaczki', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a03520dca1e2', 'szklanka mąki,', 200, 'g', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a03520dca1e2', 'dag masła,', 10, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a03520dca1e2', 'dag topionego sera (ostrego),', 20, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a03520dca1e2', 'jajko,', 1, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a03520dca1e2', 'szczypta soli,', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a03520dca1e2', 'mielona papryka,', 1, 'szt', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-a03520dca1e2', 'granulowany czosnek.', 1, 'szt', 7);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-a03520dca1e2', 1, 'Ilość porcji: 6, Kaloryczność: 236 (jedna porcja).');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-71de10af631a', 'Spagetti Kalasara', 'Źródło: WikiKuchnia.org', 'lunch', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-71de10af631a', 'Spagetti', 1, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-71de10af631a', 'srednie pomidory', 3, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-71de10af631a', 'cebula', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-71de10af631a', 'czerwona papryka', 1, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-71de10af631a', '5ml sosu sojowego', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-71de10af631a', '10ml bialego wina', 1, 'szt', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-71de10af631a', '20g masla', 1, 'szt', 7);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-71de10af631a', 1, 'Czas przygotowania: - 30 min Ilość porcji: - 2');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-8eceae6302f1', 'Surówka z pomidorów a''la Simon i Stecki', 'Źródło: WikiKuchnia.org', 'lunch', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8eceae6302f1', 'świeżych pomidorów,', 500, 'g', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8eceae6302f1', '2 łyżki bardzo drobno posiekanego szczypiorku,', 1, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8eceae6302f1', 'gęstej śmietany,', 150, 'g', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8eceae6302f1', 'sól,', 1, 'l', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8eceae6302f1', 'cukier,', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-8eceae6302f1', 'ocet winny.', 1, 'szt', 6);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-8eceae6302f1', 1, 'Czas przygotowania: 15 min, Ilość porcji: 3, Kaloryczność: -, Orientacyjny koszt: - zł.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-62d53d65f40e', 'Wafle z karmelem', 'Źródło: WikiKuchnia.org', 'afternoon_snack', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-62d53d65f40e', '1 puszka (500 g) mleka zagęszczanego - słodzonego,', 500, 'g', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-62d53d65f40e', 'paczka wafli.', 1, 'szt', 2);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-62d53d65f40e', 1, 'Czas przygotowania: 3 godziny i 20 minut, Ilość porcji: 8, Orientacyjny koszt: 7 zł.');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-b1acf609c931', 'Wegetariańskie lasagne inaczej', 'Źródło: WikiKuchnia.org', 'lunch', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-b1acf609c931', 'makaron cannelloni 180g ( ok 18 sztuk)', 180, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-b1acf609c931', 'ser żółty 150g', 1, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-b1acf609c931', 'bukiet chiński 300g', 1, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-b1acf609c931', '4 jajka', 4, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-b1acf609c931', 'majonez (4 łyżki)', 1, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-b1acf609c931', 'ketchup', 1, 'szt', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-b1acf609c931', 'sól, pieprz, papryka', 1, 'l', 7);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-b1acf609c931', 1, 'Czas przygotowania: - 20 min, Ilość porcji: 4 -, Orientacyjny koszt: -ok 2zł.(porcja)');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-84d465d95157', 'Wołowina z boczniakami', 'Źródło: WikiKuchnia.org', 'lunch', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-84d465d95157', 1, 'Czas przygotowania: 35 min (+ czas marynowania mięsa) min Ilość porcji: 6 Kaloryczność: - Orientacyjny koszt: 60 zł 1kg polędwicy wołowej 750 g boczniaków 250 ml śmietanki 30% 250 ml bulionu wołowego 2 średnie cebule 150 g masła natka pietruszki mąka sól, pieprz czarny, pieprz biały, słodka papryka oliwa z oliwek ząbek czosnku cytryna');

INSERT INTO recipes (id, name, description, meal_type, servings) VALUES ('10000000-0000-4000-8000-6055d45323fa', 'Zapiekanka z makaronem', 'Źródło: WikiKuchnia.org', 'lunch', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-6055d45323fa', 'makaron świderki najlepiej duże,', 1, 'szt', 1);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-6055d45323fa', '1-2 papryki', 1, 'szt', 2);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-6055d45323fa', 'cebule', 3, 'szt', 3);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-6055d45323fa', 'czosnek (1-2 ząbki)', 1, 'szt', 4);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-6055d45323fa', 'piersi z kurczaka', 2, 'szt', 5);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-6055d45323fa', 'oliwa z oliwek', 1, 'szt', 6);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-6055d45323fa', 'kukurydza z puszki lub fasola z kukurydzą', 1, 'szt', 7);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-6055d45323fa', 'przyprawy', 1, 'szt', 8);
INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES ('10000000-0000-4000-8000-6055d45323fa', 'żółty ser', 1, 'szt', 9);
INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES ('10000000-0000-4000-8000-6055d45323fa', 1, 'makaron świderki najlepiej duże, 1-2 papryki 3 cebule czosnek (1-2 ząbki) 2 piersi z kurczaka oliwa z oliwek kukurydza z puszki lub fasola z kukurydzą przyprawy żółty ser');
