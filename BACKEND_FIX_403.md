# Fix 403 Error for /api/payment/create-intent

## 🚨 Problème Actuel

Erreur dans la console :
```
POST http://localhost:8080/api/payment/create-intent 403 (Forbidden)
Erreur lors du paiement: Error: Erreur 403: Http failure response for http://localhost:8080/api/payment/create-intent: 403 OK
```

**Cause**: L'endpoint `/api/payment/create-intent` requiert toujours une authentification, alors qu'il doit être public pour que la page `/pricing` (non authentifiée) puisse créer un PaymentIntent.

---

## ✅ Solution Backend (Spring Security)

### 1. Vérifier le fichier SecurityConfig.java

**Fichier à modifier**: `src/main/java/com/heasystock/config/SecurityConfig.java` (ou chemin similaire)

**Configuration correcte** :

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        )
        .authorizeHttpRequests(auth -> auth
            // Routes publiques d'authentification
            .requestMatchers("/api/auth/login").permitAll()
            .requestMatchers("/api/auth/register").permitAll()

            // Routes publiques de paiement (AVANT inscription)
            .requestMatchers("/api/payment/config").permitAll()
            .requestMatchers("/api/payment/plans").permitAll()
            .requestMatchers("/api/payment/create-intent").permitAll()

            // Routes de paiement protégées (APRÈS authentification)
            .requestMatchers("/api/payment/success").authenticated()
            .requestMatchers("/api/payment/subscription").authenticated()
            .requestMatchers("/api/payment/**").authenticated()

            // Toutes les autres routes nécessitent une authentification
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}
```

### 2. Points Critiques

**IMPORTANT** : L'ordre des `.requestMatchers()` est crucial !

✅ **CORRECT** (spécifique avant général) :
```java
.requestMatchers("/api/payment/create-intent").permitAll()
.requestMatchers("/api/payment/**").authenticated()
```

❌ **INCORRECT** (général avant spécifique) :
```java
.requestMatchers("/api/payment/**").authenticated()
.requestMatchers("/api/payment/create-intent").permitAll()  // NE SERA JAMAIS ATTEINT
```

**Explication** : Spring Security utilise la première règle correspondante. Si vous mettez `/api/payment/**` avant `/api/payment/create-intent`, alors l'endpoint sera toujours protégé car il correspond à la règle générale.

### 3. Endpoints Publics de Paiement (3 endpoints)

Ces 3 endpoints doivent être publics pour le flux "Paiement AVANT Inscription" :

1. **`/api/payment/config`** - Récupère la clé publique Stripe
   - Utilisé par : `pricing.component.ts` ligne 568
   - Raison : Nécessaire pour initialiser Stripe.js

2. **`/api/payment/plans`** - Liste des plans disponibles
   - Utilisé par : `pricing.component.ts` ligne 484
   - Raison : Afficher les plans sur la page publique

3. **`/api/payment/create-intent`** - Crée un PaymentIntent
   - Utilisé par : `pricing.component.ts` ligne 648
   - Raison : Initier le paiement AVANT que l'utilisateur ne s'inscrive

### 4. Endpoints Protégés de Paiement (2 endpoints)

Ces endpoints nécessitent une authentification :

1. **`/api/payment/success`** - Confirme le paiement et active l'abonnement
   - Utilisé par : `register.component.ts` lors de l'inscription
   - Raison : Lie le paiement au compte utilisateur

2. **`/api/payment/subscription`** - Récupère le statut de l'abonnement
   - Utilisé par : Dashboard et composants authentifiés
   - Raison : Informations sensibles de l'utilisateur

---

## 🔧 Étapes de Correction

### Étape 1 : Modifier SecurityConfig.java

Ouvrez le fichier `SecurityConfig.java` dans votre backend et assurez-vous que les 3 endpoints suivants sont **AVANT** la règle générale `/api/payment/**` :

```java
// Routes publiques de paiement (dans cet ordre)
.requestMatchers("/api/payment/config").permitAll()
.requestMatchers("/api/payment/plans").permitAll()
.requestMatchers("/api/payment/create-intent").permitAll()

// Routes protégées de paiement (après)
.requestMatchers("/api/payment/**").authenticated()
```

### Étape 2 : Recompiler le Backend

**Maven** :
```bash
cd [chemin-vers-le-backend]
mvn clean install
```

**Gradle** :
```bash
cd [chemin-vers-le-backend]
./gradlew clean build
```

### Étape 3 : Redémarrer le Backend

**Si vous utilisez IDE (IntelliJ, Eclipse)** :
1. Arrêter complètement l'application (Stop button)
2. Attendre quelques secondes
3. Relancer l'application (Run/Debug)

**Si vous utilisez ligne de commande** :
```bash
# Trouver le processus Java
netstat -ano | findstr :8080

# Tuer le processus (remplacer PID par le numéro trouvé)
taskkill /PID <PID> /F

# Relancer l'application
mvn spring-boot:run
# OU
java -jar target/votre-application.jar
```

### Étape 4 : Vérifier que le Backend a Redémarré

Vérifier dans les logs de démarrage que la configuration de sécurité a été rechargée :

```
2025-11-10 ... : Initializing Spring DispatcherServlet 'dispatcherServlet'
2025-11-10 ... : Will secure any request with [...]
2025-11-10 ... : Started Application in X seconds
```

### Étape 5 : Tester l'Endpoint avec Curl ou Postman

**Avant de tester dans l'application, vérifier directement l'endpoint** :

#### Test avec Curl (Windows PowerShell)

```powershell
# Test de l'endpoint public /api/payment/create-intent
curl -X POST http://localhost:8080/api/payment/create-intent `
  -H "Content-Type: application/json" `
  -d '{\"plan\":\"BASIC\",\"devise\":\"EUR\"}'
```

**Résultat attendu** : Code 200 avec un clientSecret, PAS de 403

#### Test avec Postman

1. Créer une requête POST vers `http://localhost:8080/api/payment/create-intent`
2. Headers :
   - `Content-Type: application/json`
3. Body (raw JSON) :
   ```json
   {
     "plan": "BASIC",
     "devise": "EUR"
   }
   ```
4. Envoyer la requête

**Résultat attendu** :
```json
{
  "clientSecret": "pi_xxx_secret_yyy",
  "publishableKey": "pk_test_xxx"
}
```

**Si vous obtenez toujours 403**, le backend n'a pas été correctement mis à jour.

### Étape 6 : Vider le Cache du Navigateur

Une fois le backend corrigé, vider le cache du navigateur :

1. **Chrome/Edge** : `Ctrl + Shift + Del`
2. Cocher "Cached images and files"
3. Cliquer sur "Clear data"
4. Recharger la page `/pricing` : `Ctrl + F5`

---

## 🧪 Test Complet du Flux

Une fois le backend corrigé et redémarré :

1. Aller sur `http://localhost:4200/pricing`
2. Vérifier la console (F12) : plus d'erreur 403
3. Sélectionner un plan (ex: BASIC)
4. Vérifier que le formulaire Stripe s'affiche sans erreur
5. Entrer une carte test :
   - Numéro : `4242 4242 4242 4242`
   - Date : `12/34`
   - CVC : `123`
6. Cliquer sur "Payer maintenant"
7. Vérifier dans la console : requête POST vers `/api/payment/create-intent` → 200 OK
8. Vérifier : message "Paiement réussi !"
9. Vérifier : redirection vers `/register?paymentIntentId=pi_xxx&plan=BASIC`

---

## 🔍 Diagnostic si le Problème Persiste

### Vérifier les Logs Backend

Regarder les logs du backend lors de la requête POST :

```
2025-11-10 ... : POST /api/payment/create-intent - 403 Forbidden
```

Si vous voyez "403 Forbidden", cela signifie que la configuration n'a pas été prise en compte.

### Vérifier l'Ordre des Règles

Ajouter un log dans `SecurityConfig.java` pour vérifier l'ordre :

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    System.out.println("🔒 Configuration de sécurité chargée");

    http
        .authorizeHttpRequests(auth -> {
            System.out.println("✅ /api/payment/config → permitAll()");
            auth.requestMatchers("/api/payment/config").permitAll();

            System.out.println("✅ /api/payment/plans → permitAll()");
            auth.requestMatchers("/api/payment/plans").permitAll();

            System.out.println("✅ /api/payment/create-intent → permitAll()");
            auth.requestMatchers("/api/payment/create-intent").permitAll();

            System.out.println("🔒 /api/payment/** → authenticated()");
            auth.requestMatchers("/api/payment/**").authenticated();

            auth.anyRequest().authenticated();
        });

    return http.build();
}
```

Au redémarrage, vous devriez voir dans les logs :

```
🔒 Configuration de sécurité chargée
✅ /api/payment/config → permitAll()
✅ /api/payment/plans → permitAll()
✅ /api/payment/create-intent → permitAll()
🔒 /api/payment/** → authenticated()
```

### Vérifier le Contrôleur PaymentController

Assurez-vous que le contrôleur a bien l'endpoint :

```java
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
            @RequestBody CreatePaymentIntentRequest request) {
        // ...
    }
}
```

**Vérifier** :
- Path correct : `/api/payment/create-intent`
- Méthode HTTP : `POST`
- Pas d'annotation `@PreAuthorize` ou `@Secured` qui forcerait l'authentification

---

## 📋 Checklist de Vérification

- [ ] SecurityConfig.java modifié avec les 3 endpoints publics
- [ ] Ordre des `.requestMatchers()` correct (spécifique avant général)
- [ ] Backend recompilé (`mvn clean install` ou `gradle build`)
- [ ] Backend complètement redémarré (arrêt + redémarrage)
- [ ] Logs de démarrage vérifiés (configuration chargée)
- [ ] Test curl ou Postman réussi (200 OK au lieu de 403)
- [ ] Cache navigateur vidé (`Ctrl + Shift + Del`)
- [ ] Page `/pricing` rechargée (`Ctrl + F5`)
- [ ] Test complet du flux de paiement

---

## 🎯 Résultat Attendu

Après correction :

```
✅ GET  /api/payment/config          → 200 OK (public)
✅ GET  /api/payment/plans           → 200 OK (public)
✅ POST /api/payment/create-intent   → 200 OK (public)
🔒 POST /api/payment/success         → 401 sans auth, 200 avec auth
🔒 GET  /api/payment/subscription    → 401 sans auth, 200 avec auth
```

---

## 🚨 Si le Problème Persiste Encore

1. Partager le fichier `SecurityConfig.java` complet
2. Partager les logs de démarrage du backend
3. Partager le résultat du test curl/Postman
4. Vérifier qu'il n'y a pas de filtre CORS bloquant la requête
5. Vérifier la version de Spring Security utilisée

---

**Date de création** : 10/11/2025
**Statut** : En attente de correction backend
