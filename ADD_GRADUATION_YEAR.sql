-- ====================================
-- Ajouter le champ graduation_year à la table artists
-- ====================================
-- À exécuter dans le SQL Editor de Supabase

-- 1. Ajouter la colonne graduation_year
ALTER TABLE artists 
ADD COLUMN graduation_year VARCHAR(9) NULL;

-- 2. Ajouter un commentaire pour la documentation
COMMENT ON COLUMN artists.graduation_year IS 'Année de promotion au format YYYY-YYYY (ex: 2022-2025). Obligatoire si mmi_year = "Ancien étudiant"';

-- 3. Ajouter une contrainte pour valider le format (optionnel mais recommandé)
ALTER TABLE artists 
ADD CONSTRAINT graduation_year_format 
CHECK (graduation_year IS NULL OR graduation_year ~ '^\d{4}-\d{4}$');

-- ====================================
-- Vérification
-- ====================================
-- Pour vérifier que la colonne a bien été ajoutée :
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'artists' AND column_name = 'graduation_year';
