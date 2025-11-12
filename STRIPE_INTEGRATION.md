# Intégration Stripe - HeasyStock

## Vue d'ensemble

L'intégration Stripe permet de gérer les abonnements avec une période d'essai gratuite de 15 jours.

## Architecture Frontend

### Fichiers créés

1. **Models** (`src/app/core/models/payment.model.ts`)
   - `PlanAbonnement`: Enum des plans disponibles
   - `DevisePayment`: EUR ou XOF
   - `CreatePaymentIntentRequest`: Requête pour créer un paiement
   - `PaymentIntentResponse`: Réponse avec clientSecret
   - `PaymentSuccessRequest`: Confirmation de paiement
   - `SubscriptionStatusResponse`: Statut de l'abonnement
   - `StripeConfig`: Configuration Stripe
   - `PlanInfo`: Informations détaillées sur un plan

2. **Services** (`src/app/core/services/payment.service.ts`)
   - `getStripeConfig()`: Récupère la clé publique Stripe
   - `getSubscriptionStatus()`: Récupère le statut d'abonnement
   - `getAvailablePlans()`: Liste des plans disponibles
   - `createPaymentIntent()`: Crée un PaymentIntent
   - `confirmPaymentSuccess()`: Confirme un paiement réussi
   - `isSubscriptionActive()`: Vérifie si l'abonnement est actif
   - `isSubscriptionExpired()`: Vérifie si l'abonnement est expiré
   - `getDaysRemaining()`: Obtient le nombre de jours restants
   - `getCurrentPlan()`: Obtient le plan actuel
   - `refreshSubscriptionStatus()`: Rafraîchit le statut

3. **Components** (`src/app/features/subscription/subscription.component.ts`)
   - Affiche le statut d'abonnement actuel
   - Liste les plans disponibles
   - Permet de souscrire à un plan
   - Intègre le formulaire de paiement Stripe
   - Gère le processus de paiement complet

4. **Guards** (`src/app/core/guards/subscription.guard.ts`)
   - Vérifie si l'abonnement est actif
   - Redirige vers `/subscription` si expiré
   - Affiche des avertissements si proche de l'expiration

## Configuration Backend

### Endpoints disponibles

```
GET  /api/payment/config        - Récupère la clé publique Stripe
GET  /api/payment/subscription  - Statut de l'abonnement actuel
GET  /api/payment/plans         - Liste des plans disponibles
POST /api/payment/create-intent - Crée un PaymentIntent (ADMIN uniquement)
POST /api/payment/success       - Confirme un paiement (ADMIN uniquement)
```

### Configuration requise

Dans `application.properties` :
```properties
stripe.public.key=pk_test_votre_cle_publique_stripe
stripe.secret.key=sk_test_votre_cle_secrete_stripe
```

## Flux d'utilisation

### 1. Inscription
- L'utilisateur s'inscrit
- Un compte est créé avec le plan GRATUIT
- Date d'expiration : 15 jours après l'inscription

### 2. Période d'essai (15 jours)
- Accès complet à toutes les fonctionnalités
- Un avertissement s'affiche 3 jours avant l'expiration
- Le statut affiche "Période d'essai" et le nombre de jours restants

### 3. Après l'expiration
- Accès bloqué aux routes protégées
- Redirection automatique vers `/subscription`
- Message d'erreur : "Abonnement expiré"
- Seules les routes `/auth/*`, `/payment/*`, et `/tenant/info` restent accessibles

### 4. Souscription à un plan
1. L'utilisateur accède à `/subscription`
2. Visualise les plans disponibles (BASIC, PRO, ENTREPRISE)
3. Sélectionne un plan et une devise (EUR ou XOF)
4. Clique sur "Choisir ce plan"
5. Le formulaire de paiement Stripe s'affiche
6. Entre les informations de carte bancaire
7. Clique sur "Payer maintenant"
8. Le paiement est traité par Stripe
9. L'abonnement est activé pour 30 jours
10. Redirection automatique vers le dashboard

## Plans disponibles

### GRATUIT (Période d'essai)
- **Durée**: 15 jours
- **Prix**: Gratuit
- **Utilisateurs**: 3 maximum
- **Fonctionnalités**: Toutes

### BASIC
- **Prix**: 9,99€ / 6 555 CFA par mois
- **Utilisateurs**: 3 maximum
- **Fonctionnalités**:
  - Gestion des ventes
  - Gestion du stock
  - Gestion des achats
  - Gestion des dépenses
  - Support contact
  - Dashboard complet
  - Rapports PDF

### PRO
- **Prix**: 19,99€ / 13 110 CFA par mois
- **Utilisateurs**: 10 maximum
- **Fonctionnalités**: Toutes les fonctionnalités BASIC + fonctionnalités avancées

### ENTREPRISE
- **Prix**: 49,99€ / 32 775 CFA par mois
- **Utilisateurs**: Illimité
- **Fonctionnalités**: Toutes les fonctionnalités + support prioritaire

## Sécurité

- Les paiements sont traités par Stripe (certifié PCI DSS)
- Les informations de carte bancaire ne transitent jamais par le serveur
- Les clés API Stripe doivent être stockées de manière sécurisée
- Utilisez les clés de test pour le développement
- Utilisez les clés de production uniquement en production

## Développement

### Installation
```bash
npm install @stripe/stripe-js
```

### Configuration de test
1. Créer un compte Stripe : https://stripe.com
2. Récupérer les clés de test : https://dashboard.stripe.com/test/apikeys
3. Mettre à jour `application.properties` avec les clés de test
4. Utiliser les numéros de carte de test Stripe :
   - **Succès**: 4242 4242 4242 4242
   - **Échec**: 4000 0000 0000 0002
   - **3D Secure**: 4000 0027 6000 3184

### Cartes de test Stripe
- Date d'expiration : N'importe quelle date future
- CVC : N'importe quel 3 chiffres
- Code postal : N'importe quel code postal valide

## Routes

- `/subscription` : Page de gestion de l'abonnement (accessible après authentification)

## Guards appliqués

Pour protéger les routes avec la vérification d'abonnement, ajoutez `subscriptionGuard` :

```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard, subscriptionGuard]  // Vérifie aussi l'abonnement
}
```

## Notifications

Le système affiche automatiquement :
- ✅ Paiement réussi
- ❌ Erreurs de paiement
- ⚠️ Avertissements d'expiration (3 jours avant)
- ⚠️ Abonnement expiré

## Gestion des erreurs

Le système gère :
- Erreurs de réseau
- Erreurs de validation Stripe
- Paiements refusés
- Carte invalide
- Fonds insuffisants
- Erreurs du serveur

## Tests

### Tester la période d'essai
1. Créer un nouveau compte
2. Vérifier que `joursRestants = 15`
3. Vérifier que `actif = false`
4. Accéder aux fonctionnalités (doit fonctionner)

### Tester l'expiration
1. Modifier manuellement `dateExpiration` dans la base de données (date passée)
2. Essayer d'accéder à une route protégée
3. Vérifier la redirection vers `/subscription`

### Tester le paiement
1. Aller sur `/subscription`
2. Choisir un plan
3. Utiliser `4242 4242 4242 4242` comme numéro de carte
4. Compléter le paiement
5. Vérifier que l'abonnement est activé

## Production

Avant de déployer en production :

1. **Remplacer les clés de test par les clés de production**
2. **Activer HTTPS** (obligatoire pour Stripe)
3. **Configurer les webhooks Stripe** pour gérer :
   - Les paiements réussis
   - Les paiements échoués
   - Les renouvellements
   - Les annulations
4. **Tester en mode production** avec de petits montants
5. **Configurer la facturation récurrente** si nécessaire

## Support

- Documentation Stripe : https://stripe.com/docs
- API Stripe : https://stripe.com/docs/api
- Dashboard Stripe : https://dashboard.stripe.com
