# Réparer "Mot de passe oublié"

## Diagnostic

D'après les logs d'authentification, l'appel `/recover` renvoie bien **200** côté serveur : Lovable accepte la demande et tente d'envoyer l'email. Le problème est donc l'**acheminement de l'email**, pas le code de l'app.

Trois causes possibles, par ordre de probabilité :

1. **Email par défaut Lovable filtré en spam.** Aujourd'hui, les emails d'auth partent depuis l'expéditeur générique Lovable (aucun domaine personnalisé n'est configuré). Gmail / Outlook les classent souvent en spam, surtout pour des comptes `@gmail.com`.
2. **L'utilisateur saisit un email qui n'existe pas en base.** Supabase renvoie `200` même dans ce cas (pour ne pas révéler l'existence du compte) — donc aucun email n'est envoyé.
3. **Lien de récupération mal interprété par `/reset-password`.** La page actuelle ne valide le lien que si `window.location.hash` contient `type=recovery`. Selon le flow (PKCE / code dans la query string), le hash peut être absent → l'utilisateur arrive sur la page mais voit "Lien invalide".

## Plan d'action

### 1. Configurer un domaine email personnalisé (recommandé)

C'est la vraie solution durable. On configure un domaine d'envoi (ex. `mizani.ma` ou un sous-domaine `mail.mizani.ma`) pour que les emails partent d'une adresse de confiance et ne tombent plus en spam. Lovable provisionne automatiquement Resend en arrière-plan, sans clé API à gérer.

Étapes :
- Ouvrir le dialogue "Set up email domain" dans Cloud
- Ajouter les enregistrements DNS fournis chez le registrar
- Attendre la vérification (peut prendre quelques minutes à quelques heures)
- Les emails d'auth (signup, reset, magic link) partiront automatiquement depuis ce domaine

### 2. Robustifier `/reset-password`

Mettre à jour `src/pages/ResetPassword.tsx` pour accepter à la fois :
- l'ancien flow hash (`#access_token=...&type=recovery`)
- le nouveau flow PKCE (`?code=...` dans la query string) en appelant `supabase.auth.exchangeCodeForSession(code)`

Cela évite que des liens valides soient marqués "invalides".

### 3. (Optionnel) Personnaliser les emails d'auth

Une fois le domaine vérifié, on peut scaffolder des templates aux couleurs Mizani (or, emerald, branding bilingue FR/AR) pour que l'email de reset reflète l'identité visuelle de l'app.

## Étape suivante immédiate

Choisir entre :
- **A.** Configurer un domaine email maintenant (résout définitivement le problème de délivrabilité) + corriger `/reset-password`
- **B.** Juste corriger `/reset-password` et demander aux utilisateurs de vérifier leur dossier spam en attendant
