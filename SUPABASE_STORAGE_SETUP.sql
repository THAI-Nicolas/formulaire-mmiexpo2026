-- ====================================
-- Configuration Supabase Storage pour MMI ART 26
-- ====================================
-- À exécuter dans le SQL Editor de Supabase
-- Dashboard > SQL Editor > New Query

-- ÉTAPE 1: Supprimer toutes les anciennes politiques (si elles existent)
DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- ÉTAPE 2: Créer le bucket s'il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public)
VALUES ('mmiart26-uploads', 'mmiart26-uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ÉTAPE 3: Créer les nouvelles politiques simplifiées

-- 3.1. Autoriser TOUS les uploads anonymes (INSERT + UPDATE pour upsert)
CREATE POLICY "Allow anon insert and update"
ON storage.objects FOR ALL
TO anon
USING (bucket_id = 'mmiart26-uploads')
WITH CHECK (bucket_id = 'mmiart26-uploads');

-- 3.2. Autoriser la lecture publique (SELECT)
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mmiart26-uploads');

-- ====================================
-- Vérification des politiques
-- ====================================
-- Exécutez cette requête pour vérifier que les politiques sont bien créées :
SELECT policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%anon%' OR policyname LIKE '%public read%';

