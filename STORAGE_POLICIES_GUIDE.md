# 🔒 Configuration des Politiques de Sécurité Supabase Storage

## Problème Résolu

**Erreur:** `new row violates row-level security policy`

**Cause:** Par défaut, Supabase bloque tous les accès anonymes au Storage pour des raisons de sécurité.

**Solution:** Configurer des politiques RLS (Row Level Security) pour autoriser les uploads anonymes.

---

## 📋 Instructions Étape par Étape

### 1. Accéder au SQL Editor de Supabase

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet : **ccgqyuumczbbayfnwzfz**
3. Dans le menu latéral, cliquez sur **SQL Editor**
4. Cliquez sur **New Query**

### 2. Exécuter le Script SQL

Copiez-collez le contenu du fichier `SUPABASE_STORAGE_SETUP.sql` dans l'éditeur SQL et cliquez sur **Run**.

Le script va :

- ✅ Créer le bucket `mmiart26-uploads` (s'il n'existe pas)
- ✅ Le configurer en mode public
- ✅ Autoriser les uploads anonymes (INSERT)
- ✅ Autoriser la lecture publique (SELECT)
- ✅ Autoriser les updates/deletes pour les utilisateurs authentifiés

### 3. Vérifier la Configuration

#### Option A : Via l'interface Supabase

1. Allez dans **Storage** dans le menu latéral
2. Sélectionnez le bucket `mmiart26-uploads`
3. Cliquez sur **Policies** en haut
4. Vous devriez voir 4 politiques :
   - 🟢 `Allow anonymous uploads` (INSERT - anon)
   - 🟢 `Allow public read access` (SELECT - public)
   - 🟢 `Allow authenticated updates` (UPDATE - authenticated)
   - 🟢 `Allow authenticated deletes` (DELETE - authenticated)

#### Option B : Via SQL

Exécutez cette requête dans le SQL Editor :

```sql
SELECT * FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
```

### 4. Tester l'Upload

1. Retournez sur votre formulaire local : http://localhost:4321
2. Remplissez le formulaire
3. Ajoutez une image de test (même une grosse image de 5000ko)
4. Soumettez le formulaire

**Résultat attendu :** ✅ Upload réussi sans erreur RLS

---

## 🔐 Sécurité

### Pourquoi autoriser les uploads anonymes ?

- Le formulaire est pour des **artistes sélectionnés** uniquement
- Les artistes ne créent **pas de compte utilisateur**
- L'URL du formulaire n'est **pas publique** (partagée uniquement avec les artistes)

### Mesures de sécurité supplémentaires recommandées

1. **Limitation de taille** : Déjà implémentée dans le code (10MB avatar, 15MB œuvres)
2. **Validation des types MIME** : Déjà implémentée (JPG, PNG, WebP, etc.)
3. **Rate limiting Netlify** : Active par défaut (limite les abus)
4. **Monitoring** : Surveillez votre Dashboard Supabase pour détecter les uploads anormaux

### Si vous voulez plus de sécurité

Vous pouvez ajouter une condition supplémentaire, par exemple :

```sql
-- Limiter la taille des fichiers (50 MB max)
CREATE POLICY "Allow anonymous uploads with size limit"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'mmiart26-uploads'
  AND (metadata->>'size')::int < 52428800
);
```

---

## 🚀 Prochaines Étapes

Une fois les politiques configurées :

1. ✅ Testez localement avec des images réelles
2. ✅ Vérifiez que les images apparaissent bien dans Supabase Storage
3. ✅ Committez et poussez vos changements
4. ✅ Configurez les variables d'environnement sur Netlify :
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
5. ✅ Déployez sur Netlify
6. ✅ Testez la version en production

---

## ❓ Problèmes Courants

### Erreur persiste après avoir appliqué les politiques

1. Videz le cache du navigateur (Ctrl + Shift + R)
2. Redémarrez le serveur de dev Astro
3. Vérifiez que les politiques sont bien visibles dans l'interface Supabase

### "Storage bucket does not exist"

Le bucket n'a pas été créé. Réexécutez la première partie du script SQL :

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('mmiart26-uploads', 'mmiart26-uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

### Les images ne s'affichent pas

Vérifiez que le bucket est en mode **public** :

1. Storage > mmiart26-uploads
2. Settings
3. Cochez "Public bucket"

---

## 📞 Support

Si vous rencontrez d'autres problèmes, vérifiez :

- La console du navigateur (F12)
- Les logs Supabase (Dashboard > Logs)
- La configuration .env (PUBLIC\_ variables présentes)
