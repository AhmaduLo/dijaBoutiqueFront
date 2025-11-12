# Test Complet du Flux de Paiement - HeasyStock

## ✅ État Actuel

### Backend
- ✅ Spring Boot démarré sur `http://localhost:8080`
- ✅ Stripe SDK mis à jour vers la version 30.2.0
- ✅ Endpoints publics fonctionnels :
  - `GET /api/payment/config` → 200 OK (clé publique Stripe)
  - `GET /api/payment/plans` → 200 OK (3 plans : BASIC, PREMIUM, ENTREPRISE)
  - `POST /api/payment/create-intent` → Devrait maintenant être accessible

### Frontend
- ✅ Build Angular réussi (seulement des warnings, pas d'erreurs)
- ✅ CSP configuré dans `index.html` pour autoriser Stripe
- ✅ Composant `/pricing` créé avec intégration Stripe
- ✅ Composant `/register` modifié pour détecter le paiement préalable
- ✅ Fallback Stripe avec clé publique de test

---

## 🧪 Plan de Test Complet

### Test 1 : Vérification Backend (API)

#### 1.1 Test de l'Endpoint Config
```powershell
# Dans PowerShell
curl http://localhost:8080/api/payment/config
```

**✅ Résultat attendu** :
```json
{
  "publicKey": "pk_test_51QGbOy05YzugGAb1..."
}
```

#### 1.2 Test de l'Endpoint Plans
```powershell
curl http://localhost:8080/api/payment/plans
```

**✅ Résultat attendu** :
```json
{
  "BASIC": {
    "libelle": "Plan Basic",
    "maxUtilisateurs": 3,
    "description": "Gestion complète boutique - 3 utilisateurs",
    "prixCFA": 6555.0,
    "prixEuro": 9.99
  },
  "PREMIUM": {...},
  "ENTREPRISE": {...}
}
```

#### 1.3 Test de l'Endpoint Create Intent
```powershell
curl -X POST http://localhost:8080/api/payment/create-intent `
  -H "Content-Type: application/json" `
  -d '{\"plan\":\"BASIC\",\"devise\":\"EUR\"}'
```

**✅ Résultat attendu** :
```json
{
  "clientSecret": "pi_xxx_secret_yyy",
  "publishableKey": "pk_test_51QGbOy05YzugGAb1..."
}
```

**❌ Si vous obtenez 403** : Le backend n'a pas correctement enregistré les changements de `SecurityConfig.java`. Redémarrez le backend complètement.

---

### Test 2 : Vérification Frontend (Angular)

#### 2.1 Démarrer le Serveur Angular

```bash
cd "d:\boutique dijaSaliou\frontdijaBoutique\frontdijaBoutique"
npm start
```

Attendre que le serveur démarre sur `http://localhost:4200`

#### 2.2 Ouvrir le Navigateur

1. Ouvrir Chrome ou Edge
2. Appuyer sur `F12` pour ouvrir les outils de développement
3. Aller dans l'onglet **Console**
4. Aller dans l'onglet **Network** (Réseau)

#### 2.3 Tester la Page d'Accueil

1. Naviguer vers `http://localhost:4200/`
2. Vérifier que la landing page s'affiche correctement
3. Vérifier dans la console : **aucune erreur 403**

**✅ Attendu** : Page d'accueil avec 3 plans (Basic, Premium, Entreprise)

#### 2.4 Cliquer sur "Découvrir nos Plans"

1. Cliquer sur le bouton "Découvrir nos Plans" dans le hero
2. Vérifier la redirection vers `/pricing`

**✅ Attendu** : Redirection vers `http://localhost:4200/pricing`

---

### Test 3 : Page de Tarification (/pricing)

#### 3.1 Vérifier le Chargement Initial

Dans la console (F12), vérifier les requêtes réseau :

**✅ Requêtes attendues** :
1. `GET /api/payment/plans` → **200 OK** (pas de 403)
2. Affichage des 3 plans avec les vrais prix du backend

**Console attendue** :
```
Chargement des plans depuis l'API...
Plans chargés : [Array(3)]
```

**❌ Si 403** : Le backend n'est pas correctement configuré. Vérifier `SecurityConfig.java`.

**⚠️ Si fallback** : L'API n'est pas accessible. Les plans statiques s'affichent à la place.
```
Erreur lors du chargement des plans depuis l'API: ...
Utilisation des plans statiques
```

#### 3.2 Sélectionner un Plan

1. Cliquer sur "Choisir BASIC"
2. Vérifier que le formulaire de paiement s'affiche

**✅ Attendu** :
- La page affiche le formulaire de paiement Stripe
- Le montant affiché : **9,99€ /mois**
- Formulaire de carte bancaire visible
- Bouton "Payer maintenant"

**Console attendue** :
```
Initialisation du paiement pour le plan BASIC
Stripe chargé avec succès
```

**❌ Si erreur CSP Stripe** :
```
Refused to load the script 'https://js.stripe.com/v3/'
```

**Solution** : Vérifier que `index.html` contient bien la configuration CSP pour Stripe (déjà fait normalement).

#### 3.3 Tester le Formulaire de Carte

**Carte de test Stripe** :
- Numéro : `4242 4242 4242 4242`
- Date d'expiration : `12/34` (ou toute date future)
- CVC : `123`
- Code postal : `75001` (optionnel)

1. Entrer les informations de la carte test
2. Vérifier qu'il n'y a **pas d'erreur** dans le champ
3. Ne pas encore cliquer sur "Payer maintenant"

**✅ Attendu** : Le formulaire accepte les données sans erreur

---

### Test 4 : Processus de Paiement

#### 4.1 Cliquer sur "Payer maintenant"

**Console attendue (onglet Network)** :
1. `POST /api/payment/create-intent` → **200 OK** (pas de 403 !)
2. Réponse avec `clientSecret`
3. Appel à l'API Stripe pour confirmer le paiement

**✅ Résultat attendu** :
```
POST /api/payment/create-intent
Status: 200 OK
Response:
{
  "clientSecret": "pi_xxx_secret_yyy",
  "publishableKey": "pk_test_..."
}
```

**❌ Si 403** :
```
POST /api/payment/create-intent
Status: 403 Forbidden
```

**Cause** : Le backend n'a pas été correctement mis à jour. Redémarrer le backend et vérifier `SecurityConfig.java`.

#### 4.2 Confirmation du Paiement

**Après quelques secondes** :

**✅ Succès attendu** :
- Message : "Paiement réussi ! Créez maintenant votre compte."
- Redirection automatique vers `/register` avec query params
- URL : `http://localhost:4200/register?paymentIntentId=pi_xxx&plan=BASIC`

**Console attendue** :
```
Paiement réussi !
PaymentIntent ID: pi_xxx
Plan: BASIC
Redirection vers /register...
```

**❌ Si erreur** :
```
Erreur lors du paiement: [message]
```

**Causes possibles** :
- Clé Stripe invalide
- Problème de connexion avec Stripe
- Backend ne répond pas correctement

---

### Test 5 : Page d'Inscription avec Paiement

#### 5.1 Vérification de la Détection du Paiement

**✅ Attendu sur `/register`** :
- Bandeau vert avec message : "✅ Paiement confirmé pour le plan **BASIC**"
- Message : "Complétez votre inscription pour accéder à votre compte"

**Console attendue** :
```
Paiement détecté: pi_xxx Plan: BASIC
```

**❌ Si pas de bandeau vert** :
- Les query params n'ont pas été passés correctement
- Vérifier l'URL : doit contenir `?paymentIntentId=pi_xxx&plan=BASIC`

#### 5.2 Remplir le Formulaire d'Inscription

**Données de test** :
- Prénom : `Test`
- Nom : `Utilisateur`
- Email : `test@example.com`
- Nom Entreprise : `Ma Boutique Test`
- Adresse Entreprise : `123 Rue Test, Dakar`
- Pays : `Sénégal (+221)`
- Téléphone : `771234567` (sera converti en +221771234567)
- Mot de passe : `Test1234`
- Confirmer mot de passe : `Test1234`
- ✅ Accepter les CGU
- ✅ Accepter la Politique de Confidentialité

#### 5.3 Soumettre le Formulaire

**Console attendue (onglet Network)** :
1. `POST /api/auth/register` → **200 OK**
2. `POST /api/payment/success` → **200 OK** (activation de l'abonnement)

**✅ Succès attendu** :
- Message : "Bienvenue Test ! Inscription réussie."
- Message : "Votre abonnement a été activé avec succès !"
- Redirection vers `/dashboard`

**Console attendue** :
```
POST /api/auth/register → 200 OK
Response: { user: {...}, token: "..." }

POST /api/payment/success → 200 OK
Response: { actif: true, plan: "BASIC", joursRestants: 30 }

Redirection vers /dashboard
```

**❌ Si erreur lors de l'activation** :
```
Erreur lors de l'activation de l'abonnement
```

**Causes possibles** :
- `/api/payment/success` nécessite une authentification (c'est normal)
- Le token JWT n'est pas correctement passé dans les headers
- Le PaymentIntent est invalide ou déjà utilisé

---

### Test 6 : Accès au Dashboard

#### 6.1 Vérifier l'Accès Complet

**✅ Attendu** :
- Dashboard s'affiche normalement
- L'utilisateur est connecté
- Le plan actif est **BASIC**
- 30 jours d'abonnement restants

#### 6.2 Vérifier le Statut d'Abonnement

**Console attendue** :
```
GET /api/payment/subscription → 200 OK
Response:
{
  "actif": true,
  "plan": "BASIC",
  "joursRestants": 30,
  "dateExpiration": "2025-12-10T..."
}
```

---

## 🔄 Flux Complet Résumé

```
1. Landing Page (/)
   ↓ Clic "Découvrir nos Plans"

2. Pricing Page (/pricing)
   ✅ GET /api/payment/plans → 200 OK
   ↓ Sélection "Choisir BASIC"

3. Formulaire Stripe (/pricing)
   ↓ Saisie carte test 4242...
   ↓ Clic "Payer maintenant"
   ✅ POST /api/payment/create-intent → 200 OK
   ✅ Confirmation Stripe → Paiement réussi

4. Redirection vers Register
   URL: /register?paymentIntentId=pi_xxx&plan=BASIC
   ✅ Bandeau vert de confirmation
   ↓ Remplir formulaire

5. Soumission Inscription
   ✅ POST /api/auth/register → 200 OK
   ✅ POST /api/payment/success → 200 OK

6. Dashboard (/dashboard)
   ✅ Accès complet avec plan BASIC actif
```

---

## 🐛 Dépannage

### Problème 1 : 403 sur /api/payment/create-intent

**Symptôme** :
```
POST /api/payment/create-intent → 403 Forbidden
```

**Solution** :
1. Vérifier `SecurityConfig.java` :
   ```java
   .requestMatchers("/api/payment/create-intent").permitAll()
   ```
2. Vérifier l'ordre (doit être AVANT `/api/payment/**`)
3. Redémarrer complètement le backend
4. Tester avec curl pour vérifier

### Problème 2 : Plans statiques au lieu de l'API

**Symptôme** :
```
Console: "Erreur lors du chargement des plans depuis l'API"
Plans affichés : 9.99€, 19.99€, 49.99€ (fallback)
```

**Solution** :
1. Vérifier que le backend est démarré sur port 8080
2. Tester `curl http://localhost:8080/api/payment/plans`
3. Vérifier CORS dans le backend
4. Vérifier `environment.ts` : `apiUrl: 'http://localhost:8080/api'`

### Problème 3 : CSP bloque Stripe

**Symptôme** :
```
Refused to load the script 'https://js.stripe.com/v3/'
```

**Solution** :
1. Vérifier `src/index.html` ligne 10
2. La balise `<meta http-equiv="Content-Security-Policy">` doit inclure :
   - `script-src ... https://js.stripe.com`
   - `frame-src ... https://js.stripe.com https://hooks.stripe.com`
   - `connect-src ... https://api.stripe.com`

### Problème 4 : Paiement échoue après avoir cliqué

**Symptôme** :
```
Erreur lors du traitement du paiement
```

**Diagnostic** :
1. Vérifier la console Network : quel endpoint échoue ?
2. Si `create-intent` → problème backend
3. Si appel Stripe échoue → problème clé publique ou carte test
4. Vérifier que vous utilisez bien la carte test : `4242 4242 4242 4242`

### Problème 5 : Pas de bandeau vert sur /register

**Symptôme** :
Page d'inscription normale, pas de message de confirmation de paiement

**Diagnostic** :
1. Vérifier l'URL : doit contenir `?paymentIntentId=xxx&plan=BASIC`
2. Si les params ne sont pas là, le problème est dans `pricing.component.ts:683-688`
3. Vérifier la console : `"Paiement détecté: ..."` devrait apparaître

### Problème 6 : Activation de l'abonnement échoue

**Symptôme** :
```
Erreur lors de l'activation de l'abonnement
Redirection vers /subscription
```

**Diagnostic** :
1. Vérifier que l'utilisateur est bien connecté après l'inscription
2. Vérifier que le token JWT est stocké dans `localStorage`
3. Vérifier les logs backend pour voir l'erreur exacte
4. L'endpoint `/api/payment/success` nécessite une authentification (c'est normal)

---

## 📊 Checklist Finale

### Backend
- [ ] Backend démarré sur port 8080
- [ ] `GET /api/payment/config` → 200 OK (testé avec curl)
- [ ] `GET /api/payment/plans` → 200 OK (testé avec curl)
- [ ] `POST /api/payment/create-intent` → 200 OK (testé avec curl)
- [ ] Logs backend sans erreur

### Frontend
- [ ] `npm install` exécuté avec succès
- [ ] `npm run build` réussi (seulement warnings)
- [ ] `npm start` exécuté, serveur sur port 4200
- [ ] Page `/` affiche 3 plans
- [ ] Page `/pricing` charge les plans sans 403
- [ ] CSP configuré dans `index.html`

### Flux de Paiement
- [ ] Sélection d'un plan affiche le formulaire Stripe
- [ ] Formulaire Stripe accepte la carte test `4242...`
- [ ] Clic "Payer maintenant" crée un PaymentIntent (pas de 403)
- [ ] Paiement réussi → message de succès
- [ ] Redirection vers `/register?paymentIntentId=xxx&plan=BASIC`
- [ ] Bandeau vert de confirmation sur `/register`
- [ ] Inscription + activation de l'abonnement
- [ ] Redirection vers `/dashboard` avec accès complet

---

## 🎯 Résultat Final Attendu

**Vous avez réussi si** :
1. ✅ Aucune erreur 403 dans la console
2. ✅ Le paiement se fait avec la carte test Stripe
3. ✅ L'utilisateur est redirigé vers `/register` avec confirmation
4. ✅ L'inscription active l'abonnement automatiquement
5. ✅ L'utilisateur accède au dashboard avec plan BASIC actif pour 30 jours

**Date de création** : 10/11/2025
**Statut** : Prêt pour les tests
**Build** : ✅ Compilation réussie
**Backend** : ✅ Endpoints publics fonctionnels
