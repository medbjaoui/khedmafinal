# Instructions pour Désactiver RLS

## ⚠️ ATTENTION

Ce script va **désactiver complètement Row Level Security (RLS)** sur toutes vos tables Supabase et supprimer toutes les politiques RLS existantes.

**Conséquences :**
- Toutes les données seront accessibles à tous les utilisateurs authentifiés
- Aucune restriction d'accès au niveau ligne
- Suppression de toutes les politiques de sécurité existantes

## 🚀 Méthodes d'exécution

### Méthode 1 : Script automatique (recommandée)

```bash
# Rendre le script exécutable
chmod +x run_disable_rls.sh

# Exécuter le script
./run_disable_rls.sh
```

### Méthode 2 : Exécution manuelle

#### Avec DATABASE_URL (production)
```bash
# Définir votre URL de base de données
export DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DATABASE]"

# Exécuter le script SQL
psql "$DATABASE_URL" -f disable_all_rls.sql
```

#### Avec Supabase local
```bash
# Démarrer Supabase localement
supabase start

# Exécuter le script SQL
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f disable_all_rls.sql
```

#### Via l'interface Supabase
1. Connectez-vous à votre projet Supabase
2. Allez dans l'éditeur SQL
3. Copiez-collez le contenu de `disable_all_rls.sql`
4. Exécutez le script

## 📋 Vérifications post-exécution

Après l'exécution, vérifiez que RLS est bien désactivé :

```sql
-- Vérifier l'état RLS des tables
SELECT * FROM public.check_rls_status();

-- Lister les politiques restantes (devrait être vide)
SELECT * FROM public.list_remaining_policies();
```

## 🔄 Réactivation de RLS

Si vous voulez réactiver RLS plus tard, utilisez le script commenté dans `disable_all_rls.sql` :

```sql
-- Décommenter ces lignes pour réactiver RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
-- ... etc pour toutes les tables
```

## 📁 Fichiers créés

1. **`disable_all_rls.sql`** - Script SQL principal
2. **`run_disable_rls.sh`** - Script bash pour exécuter automatiquement
3. **`RLS_DISABLE_INSTRUCTIONS.md`** - Ce fichier d'instructions

## 🔧 Dépannage

### Erreur : "supabase command not found"
```bash
npm install -g supabase
```

### Erreur : "psql command not found"
```bash
# Sur Ubuntu/Debian
sudo apt-get install postgresql-client

# Sur macOS
brew install postgresql
```

### Erreur de connexion
- Vérifiez votre `DATABASE_URL`
- Assurez-vous que les credentials sont corrects
- Vérifiez que votre base de données est accessible

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez vos credentials de base de données
2. Assurez-vous que Supabase CLI est installé
3. Vérifiez que PostgreSQL client est installé
4. Consultez les logs d'erreur pour plus de détails

## ⚡ Rappel de sécurité

Une fois RLS désactivé, **toutes les données sont accessibles à tous les utilisateurs authentifiés**. Assurez-vous que c'est bien ce que vous voulez avant de procéder.