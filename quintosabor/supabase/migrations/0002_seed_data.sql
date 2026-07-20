-- Insertar Mermelada
WITH mermelada AS (
  INSERT INTO public.products (name, description, image_url, inventory_count, is_active)
  VALUES ('Mermelada de mora', 'Mezcla de moras, naranja y remolacha', '/Moras2.jpeg', 100, true)
  RETURNING id
)
INSERT INTO public.price_tiers (product_id, target_role, min_quantity, unit_price)
SELECT id, 'B2C', 1, 9000 FROM mermelada
UNION ALL
SELECT id, 'B2C', 2, 12000 FROM mermelada; -- Usando min_quantity como hack para variante de tamaño por ahora, pero lo ideal es tener variantes

-- Insertar Ají
WITH aji AS (
  INSERT INTO public.products (name, description, image_url, inventory_count, is_active)
  VALUES ('Ají de maracuyá', 'Opciones dulce y picante', '/marac1.jpeg', 100, true)
  RETURNING id
)
INSERT INTO public.price_tiers (product_id, target_role, min_quantity, unit_price)
SELECT id, 'B2C', 1, 9000 FROM aji
UNION ALL
SELECT id, 'B2C', 2, 12000 FROM aji;

-- Insertar Chai
WITH chai AS (
  INSERT INTO public.products (name, description, image_url, inventory_count, is_active)
  VALUES ('Té Chai', 'En polvo, 100% natural y sin endulzantes.', '/Techai1.jpeg', 100, true)
  RETURNING id
)
INSERT INTO public.price_tiers (product_id, target_role, min_quantity, unit_price)
SELECT id, 'B2C', 1, 11000 FROM chai
UNION ALL
SELECT id, 'B2C', 2, 20000 FROM chai;
