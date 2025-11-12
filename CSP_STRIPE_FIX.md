# Correction CSP pour Stripe - HeasyStock

## 🚨 Problème Identifié

L'erreur dans la console :
```
Refused to load the script 'https://js.stripe.com/v3/' because it violates
the following Content Security Policy directive: "script-src 'self'"
```

Cela signifie que le navigateur bloque le chargement du script Stripe à cause de la politique de sécurité CSP (Content Security Policy).

---

## ✅ Solution 1 : Modification du fichier index.html

Ajoutez la balise `<meta>` CSP dans `src/index.html` :

```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>HeasyStock - Gestion simplifiée</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">

  <!-- Content Security Policy pour autoriser Stripe -->
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self';
                 script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
                 style-src 'self' 'unsafe-inline';
                 frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
                 connect-src 'self' https://api.stripe.com https://*.stripe.com http://localhost:8080 http://localhost:4200;
                 img-src 'self' data: https:;">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

---

## ✅ Solution 2 : Configuration dans angular.json (Production)

Pour un environnement de production, ajoutez les headers dans `angular.json` :

```json
{
  "projects": {
    "frontdija-boutique": {
      "architect": {
        "serve": {
          "options": {
            "headers": {
              "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; frame-src 'self' https://js.stripe.com https://hooks.stripe.com; connect-src 'self' https://api.stripe.com https://*.stripe.com http://localhost:8080; img-src 'self' data: https:;"
            }
          }
        }
      }
    }
  }
}
```

---

## ✅ Solution 3 : Désactiver temporairement CSP (Développement uniquement)

**⚠️ NE PAS UTILISER EN PRODUCTION**

Si vous voulez juste tester rapidement en développement :

1. Ouvrez Chrome avec CSP désactivé :
```bash
chrome.exe --disable-web-security --user-data-dir="C:/temp/chrome"
```

2. Ou utilisez une extension Chrome : "Disable Content-Security-Policy"

---

## 📋 Explication des Directives CSP

| Directive | Description | Valeur pour Stripe |
|-----------|-------------|-------------------|
| `default-src` | Source par défaut | `'self'` (votre domaine) |
| `script-src` | Scripts JavaScript | `'self' https://js.stripe.com` |
| `frame-src` | iFrames | `https://js.stripe.com https://hooks.stripe.com` |
| `connect-src` | Requêtes AJAX/fetch | `https://api.stripe.com https://*.stripe.com` |
| `style-src` | CSS | `'self' 'unsafe-inline'` |
| `img-src` | Images | `'self' data: https:` |

---

## 🔧 Backend - Routes Corrigées

Vous avez déjà corrigé le backend pour autoriser `/api/payment/*` :

```java
// SecurityConfig.java - ligne 65
.requestMatchers("/api/payment/**").authenticated()
```

✅ Les endpoints suivants sont maintenant accessibles pour les utilisateurs authentifiés :
- `/api/payment/config` - Récupérer la clé publique Stripe
- `/api/payment/subscription` - Voir le statut de l'abonnement
- `/api/payment/plans` - Liste des plans disponibles
- `/api/payment/create-intent` - Créer un PaymentIntent
- `/api/payment/success` - Confirmer le paiement

---

## 🧪 Tester la Correction

### 1. Après modification de index.html

```bash
# Arrêter le serveur Angular
Ctrl + C

# Redémarrer le serveur
ng serve
```

### 2. Vérifier dans la console du navigateur

Ouvrez la console (F12) et vérifiez :
- ✅ Pas d'erreur CSP pour `js.stripe.com`
- ✅ Les plans s'affichent sur `/pricing`
- ✅ Le formulaire Stripe se charge après sélection d'un plan

### 3. Test complet du flux

1. Aller sur `/pricing`
2. Sélectionner un plan (ex: BASIC)
3. Vérifier que le formulaire Stripe s'affiche
4. Entrer une carte test : `4242 4242 4242 4242`
5. Date : `12/34`, CVC : `123`
6. Valider le paiement
7. Vérifier la redirection vers `/register` avec les paramètres

---

## 🌐 Configuration pour Production

En production, vous devrez également configurer le CSP côté serveur (Nginx, Apache, etc.).

### Nginx

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://js.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com; connect-src 'self' https://api.stripe.com https://*.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
```

### Apache

```apache
Header set Content-Security-Policy "default-src 'self'; script-src 'self' https://js.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com; connect-src 'self' https://api.stripe.com https://*.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
```

---

## 📝 Checklist de Vérification

- [ ] Modifier `src/index.html` avec la balise CSP
- [ ] Redémarrer le serveur Angular (`ng serve`)
- [ ] Vider le cache du navigateur (Ctrl + Shift + Del)
- [ ] Recharger la page `/pricing`
- [ ] Vérifier qu'il n'y a plus d'erreur CSP dans la console
- [ ] Vérifier que les 3 plans s'affichent (Basic, Pro, Entreprise)
- [ ] Sélectionner un plan et vérifier que le formulaire Stripe s'affiche
- [ ] Tester avec une carte test Stripe

---

## 🔐 Sécurité

Les directives CSP sont importantes pour la sécurité :

✅ **Autorisé pour Stripe :**
- `https://js.stripe.com` - Script Stripe.js
- `https://api.stripe.com` - API Stripe
- `https://hooks.stripe.com` - Webhooks Stripe

⚠️ **Éviter en production :**
- `'unsafe-inline'` - Permet les scripts inline (risque XSS)
- `'unsafe-eval'` - Permet eval() (risque d'injection)

**Note :** Angular nécessite `'unsafe-inline'` et `'unsafe-eval'` en développement. En production avec AOT, ces directives peuvent être retirées.

---

## 📚 Ressources

- [Documentation Stripe - Content Security Policy](https://stripe.com/docs/security/guide#content-security-policy)
- [MDN - Content Security Policy](https://developer.mozilla.org/fr/docs/Web/HTTP/CSP)
- [Angular Security Guide](https://angular.io/guide/security)

---

**Date de mise à jour** : 09/11/2025
**Statut** : ✅ Solution documentée et prête à appliquer
