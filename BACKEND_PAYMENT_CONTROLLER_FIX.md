# Fix Backend PaymentController - Paiement AVANT Inscription

## 🚨 Problème Identifié

L'endpoint `/api/payment/create-intent` est maintenant **accessible** (pas de 403 ✅), mais il échoue avec l'erreur suivante :

```json
{
  "error": "Erreur",
  "message": "Cannot invoke \"org.springframework.security.core.Authentication.getName()\" because \"authentication\" is null",
  "timestamp": "2025-11-10T14:52:21.4721737",
  "status": 400
}
```

**Cause** : Le contrôleur `PaymentController` essaie d'accéder à l'utilisateur connecté (`Authentication.getName()`), mais pour le flux "Paiement AVANT Inscription", **il n'y a pas encore d'utilisateur connecté**.

---

## ✅ Solution

Le backend doit être modifié pour créer un PaymentIntent **sans** authentification. Voici les changements nécessaires dans `PaymentController.java` :

---

### 1. Modifier la Méthode createPaymentIntent

**Fichier** : `src/main/java/com/example/dijasaliou/controller/PaymentController.java`

**AVANT (code actuel qui cause l'erreur)** :

```java
@PostMapping("/create-intent")
public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
        @RequestBody CreatePaymentIntentRequest request,
        Authentication authentication) {  // ← PROBLÈME : authentication est null

    String userEmail = authentication.getName();  // ← NullPointerException ici !

    // Le reste du code...
}
```

**APRÈS (code corrigé)** :

```java
/**
 * Crée un PaymentIntent pour un paiement AVANT inscription
 * Endpoint PUBLIC (pas d'authentification requise)
 */
@PostMapping("/create-intent")
public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
        @RequestBody CreatePaymentIntentRequest request,
        Authentication authentication) {  // authentication peut être null

    try {
        // Pour le flux "Paiement AVANT Inscription", authentication sera null
        // Le PaymentIntent sera créé sans lien avec un utilisateur pour l'instant
        // Il sera lié à l'utilisateur plus tard via /payment/success

        String userEmail = null;
        if (authentication != null) {
            userEmail = authentication.getName();
        }

        // Récupérer les informations du plan
        PlanAbonnement plan = request.getPlan();
        DevisePayment devise = request.getDevise();

        // Calculer le montant selon le plan et la devise
        long montantCentimes = calculerMontant(plan, devise);

        // Créer le PaymentIntent via le service Stripe
        PaymentIntent paymentIntent;

        if (userEmail != null) {
            // Utilisateur déjà connecté (renouvellement d'abonnement par exemple)
            paymentIntent = stripeService.createPaymentIntent(
                montantCentimes,
                devise.toString().toLowerCase(),
                plan,
                userEmail
            );
        } else {
            // Paiement AVANT inscription (pas d'email utilisateur)
            paymentIntent = stripeService.createPaymentIntent(
                montantCentimes,
                devise.toString().toLowerCase(),
                plan,
                null  // Pas d'email pour l'instant
            );
        }

        // Récupérer la clé publique Stripe
        String stripePublicKey = stripeService.getPublicKey();

        PaymentIntentResponse response = new PaymentIntentResponse();
        response.setClientSecret(paymentIntent.getClientSecret());
        response.setPublishableKey(stripePublicKey);

        return ResponseEntity.ok(response);

    } catch (Exception e) {
        log.error("Erreur lors de la création du PaymentIntent", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(null);
    }
}

/**
 * Calcule le montant en centimes selon le plan et la devise
 */
private long calculerMontant(PlanAbonnement plan, DevisePayment devise) {
    switch (plan) {
        case BASIC:
            return devise == DevisePayment.EUR ? 999L : 655500L;  // 9.99€ ou 6555 CFA
        case PREMIUM:
            return devise == DevisePayment.EUR ? 2999L : 1966500L;  // 29.99€ ou 19665 CFA
        case ENTREPRISE:
            return devise == DevisePayment.EUR ? 9999L : 6555000L;  // 99.99€ ou 65550 CFA
        default:
            throw new IllegalArgumentException("Plan invalide : " + plan);
    }
}
```

---

### 2. Modifier la Méthode dans StripeService

**Fichier** : `src/main/java/com/example/dijasaliou/service/StripeService.java`

**AVANT** :

```java
public PaymentIntent createPaymentIntent(Long amount, String currency, PlanAbonnement plan, String customerEmail) {
    // ...
    Map<String, String> metadata = new HashMap<>();
    metadata.put("plan", plan.toString());
    metadata.put("customerEmail", customerEmail);  // ← PROBLÈME si customerEmail est null
    // ...
}
```

**APRÈS** :

```java
public PaymentIntent createPaymentIntent(Long amount, String currency, PlanAbonnement plan, String customerEmail) {
    try {
        // Créer les métadonnées
        Map<String, String> metadata = new HashMap<>();
        metadata.put("plan", plan.toString());

        // Ajouter l'email seulement s'il est fourni
        if (customerEmail != null && !customerEmail.isEmpty()) {
            metadata.put("customerEmail", customerEmail);
        } else {
            metadata.put("customerEmail", "non_connecte");  // Placeholder pour paiement avant inscription
        }

        // Créer les paramètres du PaymentIntent
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(amount)
            .setCurrency(currency)
            .putAllMetadata(metadata)
            .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                    .setEnabled(true)
                    .build()
            )
            .build();

        // Créer le PaymentIntent
        PaymentIntent paymentIntent = PaymentIntent.create(params);

        log.info("PaymentIntent créé : {} pour le plan {} (email: {})",
            paymentIntent.getId(), plan, customerEmail != null ? customerEmail : "non connecté");

        return paymentIntent;

    } catch (StripeException e) {
        log.error("Erreur lors de la création du PaymentIntent", e);
        throw new RuntimeException("Erreur Stripe : " + e.getMessage());
    }
}
```

---

### 3. Vérifier les Prix dans calculerMontant()

**⚠️ IMPORTANT** : Les prix doivent correspondre à ceux du frontend.

**Frontend** (`pricing.component.ts:500-553`) :
- BASIC : 9.99€ (6555 CFA)
- PRO : 19.99€ (13110 CFA)
- ENTREPRISE : 49.99€ (32775 CFA)

**Backend** (attendu dans `PaymentController.java`) :

```java
private long calculerMontant(PlanAbonnement plan, DevisePayment devise) {
    switch (plan) {
        case BASIC:
            // 9.99€ = 999 centimes | 6555 CFA = 655500 centimes
            return devise == DevisePayment.EUR ? 999L : 655500L;

        case PRO:
            // 19.99€ = 1999 centimes | 13110 CFA = 1311000 centimes
            return devise == DevisePayment.EUR ? 1999L : 1311000L;

        case ENTREPRISE:
            // 49.99€ = 4999 centimes | 32775 CFA = 3277500 centimes
            return devise == DevisePayment.EUR ? 4999L : 3277500L;

        case GRATUIT:
            return 0L;

        default:
            throw new IllegalArgumentException("Plan invalide : " + plan);
    }
}
```

**⚠️ Note** : Stripe travaille en **centimes** pour EUR et en **centimes de CFA** pour XOF.
- 9.99€ = 999 centimes
- 6555 CFA = 655500 centimes (car 1 CFA = 100 centimes)

---

### 4. Vérifier les Enums PlanAbonnement et DevisePayment

**Enum PlanAbonnement** (doit correspondre entre frontend et backend) :

```java
public enum PlanAbonnement {
    GRATUIT,
    BASIC,
    PRO,        // Ou PREMIUM si c'est ce que vous utilisez
    ENTREPRISE
}
```

**Frontend** (`payment.model.ts`) :
```typescript
export enum PlanAbonnement {
  GRATUIT = 'GRATUIT',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTREPRISE = 'ENTREPRISE'
}
```

**⚠️ IMPORTANT** : Le frontend utilise `PRO` mais le backend pourrait utiliser `PREMIUM`. Vérifiez la cohérence !

Si le backend utilise `PREMIUM`, vous avez 2 options :

**Option A** : Modifier le backend pour utiliser `PRO` :
```java
public enum PlanAbonnement {
    GRATUIT,
    BASIC,
    PRO,          // ← Changer PREMIUM en PRO
    ENTREPRISE
}
```

**Option B** : Modifier le frontend pour utiliser `PREMIUM` :
```typescript
export enum PlanAbonnement {
  GRATUIT = 'GRATUIT',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',  // ← Changer PRO en PREMIUM
  ENTREPRISE = 'ENTREPRISE'
}
```

**Recommandation** : Utiliser `PRO` partout pour la cohérence.

---

### 5. Enum DevisePayment

**Backend** :
```java
public enum DevisePayment {
    EUR,
    XOF
}
```

**Frontend** :
```typescript
export enum DevisePayment {
  EUR = 'EUR',
  XOF = 'XOF'
}
```

✅ Cohérent, pas de changement nécessaire.

---

## 🔧 Étapes de Correction

### Étape 1 : Modifier PaymentController.java

1. Ouvrir `src/main/java/com/example/dijasaliou/controller/PaymentController.java`
2. Remplacer la méthode `createPaymentIntent()` avec le code fourni ci-dessus
3. Ajouter la méthode privée `calculerMontant()` avec les bons prix
4. Sauvegarder le fichier

### Étape 2 : Modifier StripeService.java

1. Ouvrir `src/main/java/com/example/dijasaliou/service/StripeService.java`
2. Modifier la méthode `createPaymentIntent()` pour gérer `customerEmail == null`
3. Sauvegarder le fichier

### Étape 3 : Vérifier l'Enum PlanAbonnement

1. Ouvrir `src/main/java/com/example/dijasaliou/model/PlanAbonnement.java`
2. Vérifier qu'il contient bien `BASIC`, `PRO` (ou `PREMIUM`), `ENTREPRISE`
3. Si c'est `PREMIUM`, soit :
   - Changer en `PRO` dans le backend
   - Ou changer `PRO` en `PREMIUM` dans le frontend

### Étape 4 : Recompiler le Backend

```bash
cd [chemin-vers-backend]
mvn clean install
```

### Étape 5 : Redémarrer le Backend

**IDE** : Stop puis Run
**Ligne de commande** : Tuer le processus puis relancer

```bash
# Trouver le processus
netstat -ano | findstr :8080

# Tuer (remplacer PID)
taskkill /PID <PID> /F

# Relancer
mvn spring-boot:run
```

### Étape 6 : Tester l'Endpoint

```bash
curl -X POST http://localhost:8080/api/payment/create-intent -H "Content-Type: application/json" -d "{\"plan\":\"BASIC\",\"devise\":\"EUR\"}"
```

**✅ Résultat attendu** :
```json
{
  "clientSecret": "pi_xxx_secret_yyy",
  "publishableKey": "pk_test_51..."
}
```

**❌ Si erreur** : Partager le message d'erreur exact et les logs du backend.

---

## 🧪 Test Complet Après Correction

### Test 1 : Endpoint avec curl

```bash
curl -X POST http://localhost:8080/api/payment/create-intent \
  -H "Content-Type: application/json" \
  -d '{"plan":"BASIC","devise":"EUR"}'
```

**Attendu** : Code 200 avec `clientSecret`

### Test 2 : Dans l'Application

1. Aller sur `http://localhost:4200/pricing`
2. Cliquer sur "Choisir BASIC"
3. Entrer la carte test : `4242 4242 4242 4242`
4. Cliquer sur "Payer maintenant"
5. Vérifier dans la console Network :
   - `POST /api/payment/create-intent` → **200 OK**
   - Réponse avec `clientSecret`
6. Paiement devrait réussir

---

## 📋 Checklist de Vérification

- [ ] `PaymentController.java` modifié pour gérer `authentication == null`
- [ ] `StripeService.java` modifié pour accepter `customerEmail == null`
- [ ] Méthode `calculerMontant()` ajoutée avec les bons prix
- [ ] Enum `PlanAbonnement` cohérent entre frontend et backend
- [ ] Backend recompilé (`mvn clean install`)
- [ ] Backend redémarré complètement
- [ ] Test curl réussi (200 OK avec clientSecret)
- [ ] Test dans l'application réussi (paiement fonctionne)

---

## 🎯 Résumé de la Correction

**Problème** : Le backend essayait d'accéder à l'utilisateur connecté, mais pour le flux "Paiement AVANT Inscription", il n'y a pas encore d'utilisateur.

**Solution** : Modifier `PaymentController` et `StripeService` pour :
1. Accepter `authentication == null`
2. Créer le PaymentIntent sans email utilisateur si non connecté
3. Stocker `"non_connecte"` dans les métadonnées Stripe
4. Lier le paiement à l'utilisateur plus tard via `/payment/success` après l'inscription

**Avantage** : Le même endpoint peut servir pour :
- Paiement AVANT inscription (utilisateur non connecté)
- Renouvellement d'abonnement (utilisateur connecté)

---

**Date de création** : 10/11/2025
**Statut** : En attente de modification backend
**Frontend** : ✅ Prêt
**Backend** : ⚠️ Nécessite modification de PaymentController et StripeService
