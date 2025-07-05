# Analyse de Sécurité RLS - Supabase

## Résumé Exécutif

L'analyse du code RLS (Row Level Security) de Supabase révèle plusieurs **vulnérabilités de sécurité critiques** qui compromettent l'intégrité du système d'autorisation. Les problèmes principaux incluent des politiques temporaires excessivement permissives qui contournent complètement les contrôles d'accès.

## Problèmes Identifiés

### 🔴 CRITIQUE - Politiques Temporaires Permissives

**Problème :** Plusieurs tables ont des politiques "Temporary admin access" qui utilisent `using (true)`, permettant l'accès à **tous les utilisateurs authentifiés** sans aucune vérification.

**Tables affectées :**
- `admin_settings`
- `jobs`
- `system_alerts`
- `system_logs`
- `transactions`
- `user_profiles`

**Code problématique :**
```sql
create policy "Temporary admin access - admin_settings"
on "public"."admin_settings"
as permissive
for all
to authenticated
using (true);
```

**Impact :** N'importe quel utilisateur connecté peut :
- Accéder aux paramètres d'administration
- Consulter les journaux système
- Voir toutes les transactions
- Accéder aux profils de tous les utilisateurs

### 🟡 MOYEN - Politiques Redondantes

**Problème :** Certaines tables ont des politiques légitimes **ET** des politiques temporaires permissives, créant une confusion et des failles de sécurité.

**Exemple :**
```sql
-- Politique légitime
create policy "Admins can access admin settings"
on "public"."admin_settings"
using (is_admin());

-- Politique problématique qui contourne la première
create policy "Temporary admin access - admin_settings"
using (true);
```

### 🟡 MOYEN - Fonction d'Administration

**Problème :** La fonction `is_admin()` fonctionne correctement mais est contournée par les politiques temporaires.

**Code actuel :**
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
AS $function$
BEGIN
  RETURN (
    SELECT COALESCE(raw_user_meta_data->>'role', '') = 'Admin'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$function$
```

### 🟢 CORRECT - Politiques Utilisateur

**Aspect positif :** Les politiques pour les données utilisateur sont correctement implémentées :
```sql
create policy "Users can manage own applications"
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));
```

## Recommandations de Correction

### 1. Supprimer les Politiques Temporaires Permissives

**Action immédiate :** Supprimer toutes les politiques "Temporary admin access" :

```sql
-- Supprimer les politiques dangereuses
DROP POLICY IF EXISTS "Temporary admin access - admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Temporary admin access - jobs" ON public.jobs;
DROP POLICY IF EXISTS "Temporary admin access - system_alerts" ON public.system_alerts;
DROP POLICY IF EXISTS "Temporary admin access - system_logs" ON public.system_logs;
DROP POLICY IF EXISTS "Temporary admin access - transactions" ON public.transactions;
DROP POLICY IF EXISTS "Temporary admin access - user_profiles" ON public.user_profiles;
```

### 2. Implémenter des Politiques Correctes

**Pour les tables système :**
```sql
-- Politique correcte pour les jobs (lecture publique, écriture admin)
create policy "Public can view active jobs"
on "public"."jobs"
as permissive
for select
to authenticated
using (is_active = true);

create policy "Admins can manage jobs"
on "public"."jobs"
as permissive
for all
to authenticated
using (is_admin())
with check (is_admin());
```

**Pour les transactions :**
```sql
-- Seuls les utilisateurs peuvent voir leurs propres transactions
create policy "Users can view own transactions"
on "public"."transactions"
as permissive
for select
to authenticated
using (auth.uid() = user_id);

-- Seuls les admins peuvent gérer toutes les transactions
create policy "Admins can manage all transactions"
on "public"."transactions"
as permissive
for all
to authenticated
using (is_admin())
with check (is_admin());
```

### 3. Renforcer les Contrôles d'Accès

**Fonction d'administration renforcée :**
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Vérification avec logging
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN (
    SELECT COALESCE(raw_user_meta_data->>'role', '') = 'Admin'
    FROM auth.users
    WHERE id = auth.uid()
    AND email_confirmed_at IS NOT NULL
  );
END;
$function$
```

### 4. Politiques de Stockage

**Vérification :** Les politiques de stockage pour les CVs et lettres de motivation sont correctement implémentées :
```sql
-- Exemple correct pour les CVs
CREATE POLICY "Allow authenticated select on cvs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'cvs' AND auth.uid() = (storage.foldername(name))[1]::uuid);
```

## Plan de Correction Prioritaire

### Phase 1 - Correction Immédiate (Critique)
1. **Supprimer toutes les politiques temporaires permissives**
2. **Tester l'accès admin avec la fonction `is_admin()`**
3. **Vérifier que les admins peuvent toujours accéder aux tables système**

### Phase 2 - Implémentation Correcte
1. **Créer des politiques granulaires pour chaque table**
2. **Implémenter des politiques de lecture/écriture séparées**
3. **Ajouter des logs d'audit pour les accès admin**

### Phase 3 - Tests et Validation
1. **Tester l'accès avec différents types d'utilisateurs**
2. **Vérifier que les utilisateurs normaux ne peuvent plus accéder aux données système**
3. **Confirmer que les admins conservent leurs privilèges**

## Script de Correction

```sql
-- Phase 1: Supprimer les politiques dangereuses
DROP POLICY IF EXISTS "Temporary admin access - admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Temporary admin access - jobs" ON public.jobs;
DROP POLICY IF EXISTS "Temporary admin access - system_alerts" ON public.system_alerts;
DROP POLICY IF EXISTS "Temporary admin access - system_logs" ON public.system_logs;
DROP POLICY IF EXISTS "Temporary admin access - transactions" ON public.transactions;
DROP POLICY IF EXISTS "Temporary admin access - user_profiles" ON public.user_profiles;

-- Phase 2: Créer des politiques correctes
create policy "Public can view active jobs"
on "public"."jobs"
as permissive
for select
to authenticated
using (is_active = true);

create policy "Admins can manage jobs"
on "public"."jobs"
as permissive
for all
to authenticated
using (is_admin())
with check (is_admin());

create policy "Users can view own transactions"
on "public"."transactions"
as permissive
for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can manage all transactions"
on "public"."transactions"
as permissive
for all
to authenticated
using (is_admin())
with check (is_admin());

-- Continuer pour les autres tables...
```

## Conclusion

Les vulnérabilités identifiées représentent un **risque de sécurité majeur** qui doit être corrigé immédiatement. Les politiques temporaires permissives compromettent entièrement l'intégrité du système d'autorisation et permettent l'accès non autorisé aux données sensibles.

**Recommandation :** Appliquer le script de correction immédiatement et tester thoroughly avant le déploiement en production.