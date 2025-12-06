# Formulaire d'inscription MMI ART 26

Un formulaire moderne et minimaliste pour collecter les informations des **artistes sélectionnés** pour l'exposition MMI ART 26. Le design s'inspire d'une direction artistique noir et blanc avec des formes organiques et géométriques minimalistes.

> ⚠️ **Important** : Ce formulaire n'est **PAS une candidature**. Il est destiné aux artistes déjà sélectionnés pour collecter leurs informations et œuvres qui seront affichées sur le site web de l'exposition.

## 🚀 Démarrage Rapide

```powershell
# 1. Installer les dépendances
npm install

# 2. Configurer Supabase (voir SUPABASE_SETUP.md)
Copy-Item .env.example .env
# Éditez .env avec vos credentials Supabase

# 3. Lancer le projet
npm run dev
```

**Ou utilisez le script automatique :**

```powershell
.\start.ps1
```

## 📚 Documentation

- **[START_HERE.md](START_HERE.md)** - 👈 **COMMENCEZ ICI** pour un guide complet
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Configuration Supabase pas à pas
- **[SUMMARY.md](SUMMARY.md)** - Résumé de ce qui est en place
- **[DESIGN.md](DESIGN.md)** - Direction artistique détaillée

## ✅ Connexion Supabase

**OUI**, le projet est entièrement configuré pour Supabase :

- Client Supabase prêt (`src/lib/supabase.ts`)
- Types TypeScript définis (`src/lib/database.types.ts`)
- API endpoint fonctionnel (`src/pages/api/submit.ts`)
- Schema SQL complet (`supabase-schema.sql`)

**Il suffit de :**

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Configurer `.env` avec vos credentials
3. Exécuter le script SQL pour créer les tables
4. C'est prêt ! 🎉

Voir [SUPABASE_SETUP.md](SUPABASE_SETUP.md) pour le guide complet.

## 🚀 Stack Technique

- **Frontend**: Astro 4.x + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Design noir et blanc minimaliste
- **Upload**: Gestion des images avec preview

## 📦 Installation

1. **Cloner et installer les dépendances**:

```bash
npm install
```

2. **Configurer Supabase**:
   - Créez un compte sur [supabase.com](https://supabase.com)
   - Créez un nouveau projet
   - Copiez `.env.example` vers `.env` et ajoutez vos credentials:

   ```
   SUPABASE_URL=votre_url_supabase
   SUPABASE_ANON_KEY=votre_cle_anonyme
   ```

3. **Créer la base de données**:
   - Ouvrez le SQL Editor dans Supabase
   - Exécutez le script `supabase-schema.sql`
   - Créez le bucket de storage:

   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('mmiart26-uploads', 'mmiart26-uploads', true);
   ```

4. **Lancer le serveur de développement**:

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:4321`

## 📁 Structure du Projet

```
src/
├── components/
│   └── Form/
│       ├── ArtistSection.astro      # Informations personnelles
│       ├── SocialLinks.astro        # Réseaux sociaux (dynamique)
│       ├── BioSection.astro         # Section "Qui êtes-vous ?"
│       ├── WorkSection.astro        # Gestion des œuvres (dynamique)
│       └── SubmitButton.astro       # Validation et envoi
├── pages/
│   ├── index.astro                  # Page d'accueil (redirect)
│   ├── inscription.astro            # Page du formulaire
│   └── api/
│       └── submit.ts                # API endpoint pour soumission
├── lib/
│   ├── supabase.ts                  # Client Supabase
│   └── database.types.ts            # Types TypeScript
├── actions/
│   └── index.ts                     # Astro Actions (optionnel)
└── styles/
    └── globals.css                  # Styles globaux
```

## ✨ Fonctionnalités

### Section 1: Informations Personnelles

- Nom/prénom ou pseudo
- Année MMI (select)
- Âge
- Email (validation HTML5)
- Avatar (upload avec preview, JPG/PNG, 500x500px min, 5MB max)

### Section 2: Réseaux Sociaux

- Ajout/suppression dynamique
- Plateformes: Instagram, Portfolio, LinkedIn, TikTok, Autre
- Validation URL

### Section 3: Bio

- Textarea pour présentation personnelle
- Minimum 10 caractères

### Section 4: Œuvres

- Ajout/suppression dynamique d'œuvres
- Pour chaque œuvre:
  - Titre
  - Année
  - Catégorie (Digital Art, Illustration, etc.)
  - Techniques utilisées
  - 1 à 3 images (preview, max 5MB chacune)
  - Description détaillée
- Maximum 10 œuvres

### Section 5: Validation

- Checklist de 4 points obligatoires:
  - Champs remplis
  - Visuels haute définition
  - Droits d'utilisation
  - Consentement diffusion
- Bouton submit avec loader
- Messages de succès/erreur

## 🎨 Design

Le design suit une esthétique minimaliste noir et blanc:

- Typographie: Inter (Google Fonts)
- Palette: noir (#000000) et blanc (#FFFFFF)
- Accents: nuances de gris (slate)
- Inputs: soulignage noir uniquement
- Boutons: fond noir, texte blanc
- Animations: fade-in subtiles

## 🗄️ Base de Données

### Tables Supabase

**artists**

- id (UUID, PK)
- name (VARCHAR)
- mmi_year (VARCHAR)
- age (INT)
- email (VARCHAR)
- avatar_url (VARCHAR)
- bio (TEXT)
- created_at (TIMESTAMP)

**social_links**

- id (UUID, PK)
- artist_id (UUID, FK)
- platform (VARCHAR)
- link (VARCHAR)
- created_at (TIMESTAMP)

**works**

- id (UUID, PK)
- artist_id (UUID, FK)
- title (VARCHAR)
- year (INT)
- category (VARCHAR)
- technique (TEXT)
- description (TEXT)
- created_at (TIMESTAMP)

**work_images**

- id (UUID, PK)
- work_id (UUID, FK)
- image_url (VARCHAR)
- created_at (TIMESTAMP)

### Storage

Bucket: `mmiart26-uploads`

- Avatars: `artists/{artist_id}/avatar.{ext}`
- Œuvres: `works/{work_id}/{index}.{ext}`

## 🔧 Configuration Supabase

Pour utiliser le MCP Supabase (Model Context Protocol):

Ajoutez dans votre `claude_desktop_config.json` ou configuration MCP:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Déploiement recommandé

- **Vercel**: Déploiement automatique depuis Git
- **Netlify**: Support complet Astro
- **Cloudflare Pages**: Performance optimale

## 📝 Notes Importantes

1. **Variables d'environnement**: Ne jamais commiter `.env`
2. **Images**: Les uploads nécessitent la configuration du bucket Supabase
3. **Validation**: Côté client ET serveur pour sécurité
4. **Performance**: Les images sont prévisualisées côté client avant upload
5. **Responsive**: Design adaptatif via Tailwind CSS

## 🐛 Troubleshooting

- **Erreur TypeScript**: Exécuter `npm install` pour installer les dépendances
- **Supabase connection error**: Vérifier les credentials dans `.env`
- **Upload error**: Vérifier que le bucket existe et les policies sont configurées
- **Build error**: S'assurer que toutes les dépendances sont installées

## 📄 Licence

© 2026 MMI ART 26 - Tous droits réservés
