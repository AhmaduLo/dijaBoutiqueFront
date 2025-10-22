# 🔐 Système d'Authentification - Dija Boutique

## ✅ Implémentation Complète

L'application dispose maintenant d'un système d'authentification complet avec inscription, connexion et protection des routes.

---

## 📋 Fonctionnalités Implémentées

### ✅ 1. Inscription
- **Route :** `/register`
- **Composant :** `RegisterComponent`
- **Formulaire avec validation :**
  - Prénom (requis)
  - Nom (requis)
  - Email (requis, format email valide)
  - Mot de passe (requis, minimum 6 caractères)
  - Confirmation du mot de passe (doit correspondre)
- **Après inscription :** Redirection automatique vers le dashboard

### ✅ 2. Connexion
- **Route :** `/login`
- **Composant :** `LoginComponent`
- **Formulaire :**
  - Email (requis, format email valide)
  - Mot de passe (requis)
- **Après connexion :** Redirection automatique vers le dashboard
- **Stockage :** Token JWT + données utilisateur dans localStorage

### ✅ 3. Déconnexion
- **Bouton dans le header** (visible uniquement si connecté)
- **Confirmation** avant déconnexion
- **Nettoyage complet :** Suppression du token et des données utilisateur
- **Redirection** vers la page de connexion

### ✅ 4. Protection des Routes
- **Routes publiques :** `/login` et `/register` (accessibles uniquement si non connecté)
- **Routes protégées :** Toutes les autres routes nécessitent une authentification
  - `/dashboard`
  - `/achats`
  - `/ventes`
  - `/depenses`
  - `/rapports`
- **Redirection automatique :**
  - Si non connecté → `/login`
  - Si déjà connecté et accès à `/login` ou `/register` → `/dashboard`

### ✅ 5. Affichage Dynamique du Header
- **Si non connecté :**
  - Logo seulement
  - Boutons "Connexion" et "Inscription"
  - Menu de navigation masqué
- **Si connecté :**
  - Logo
  - Menu de navigation complet
  - Nom de l'utilisateur affiché
  - Bouton de déconnexion

---

## 🔧 Structure Technique

### Modèles (auth.model.ts)
```typescript
interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role?: string;
}

interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}
```

### Service (auth.service.ts)
```typescript
class AuthService {
  // Observables
  currentUser$: Observable<User | null>

  // Méthodes principales
  register(data: RegisterRequest): Observable<AuthResponse>
  login(credentials: LoginRequest): Observable<AuthResponse>
  logout(): void
  isAuthenticated(): boolean
  getCurrentUser(): User | null
  getCurrentUserId(): number
  getToken(): string | null
}
```

### Guards (auth.guard.ts)
```typescript
// Protège les routes nécessitant une authentification
authGuard()

// Empêche l'accès aux pages auth si déjà connecté
guestGuard()
```

### Intercepteurs

**1. authInterceptor** (auth.interceptor.ts)
- Ajoute automatiquement le token JWT à toutes les requêtes HTTP
- Format : `Authorization: Bearer <token>`
- Exclut les requêtes d'authentification (`/auth/login`, `/auth/register`)

**2. httpErrorInterceptor** (http-error.interceptor.ts)
- Gère les erreurs HTTP de manière centralisée
- Formate les messages d'erreur
- Gère les erreurs 401 (non autorisé)

---

## 🔗 Endpoints Backend Attendus

L'application s'attend à ces endpoints côté Spring Boot :

### 1. Inscription
```
POST http://localhost:8080/api/auth/register

Request Body:
{
  "nom": "Saliou",
  "prenom": "Dija",
  "email": "dija@example.com",
  "password": "motdepasse123"
}

Response (200 OK):
{
  "user": {
    "id": 1,
    "nom": "Saliou",
    "prenom": "Dija",
    "email": "dija@example.com",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Connexion
```
POST http://localhost:8080/api/auth/login

Request Body:
{
  "email": "dija@example.com",
  "password": "motdepasse123"
}

Response (200 OK):
{
  "user": {
    "id": 1,
    "nom": "Saliou",
    "prenom": "Dija",
    "email": "dija@example.com",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (401 Unauthorized) si échec:
{
  "message": "Email ou mot de passe incorrect"
}
```

### 3. Requêtes Authentifiées
Toutes les autres requêtes doivent inclure le token dans le header :
```
GET http://localhost:8080/api/achats/utilisateur/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 💾 Stockage des Données

### localStorage
Le frontend stocke deux éléments dans le localStorage du navigateur :

1. **dija_auth_token** : Le token JWT
2. **dija_user** : Les données de l'utilisateur (format JSON)

```javascript
// Exemple de contenu localStorage
{
  "dija_auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "dija_user": "{\"id\":1,\"nom\":\"Saliou\",\"prenom\":\"Dija\",\"email\":\"dija@example.com\"}"
}
```

### Sécurité
⚠️ **Important :** Le token est stocké en clair dans localStorage. Pour une sécurité maximale en production :
- Utilisez httpOnly cookies (côté backend)
- Implémentez un refresh token system
- Ajoutez une expiration courte aux tokens (15-30 minutes)

---

## 🔄 Flux d'Authentification

### Inscription
```
1. User remplit formulaire → RegisterComponent
2. Validation du formulaire (client-side)
3. POST /api/auth/register
4. Backend crée l'utilisateur + génère token JWT
5. Response {user, token}
6. Frontend stocke token + user dans localStorage
7. currentUserSubject.next(user)
8. Redirection vers /dashboard
9. Notification de succès
```

### Connexion
```
1. User remplit formulaire → LoginComponent
2. Validation du formulaire
3. POST /api/auth/login
4. Backend vérifie credentials + génère token JWT
5. Response {user, token}
6. Frontend stocke token + user dans localStorage
7. currentUserSubject.next(user)
8. Redirection vers /dashboard
9. Notification de bienvenue
```

### Déconnexion
```
1. User clique sur "Déconnexion"
2. Confirmation demandée
3. localStorage.removeItem('dija_auth_token')
4. localStorage.removeItem('dija_user')
5. currentUserSubject.next(null)
6. Redirection vers /login
```

### Protection des Routes
```
1. User essaie d'accéder à /dashboard
2. authGuard() vérifié
3. Si token présent → Accès autorisé
4. Si pas de token → Redirection vers /login
```

### Requêtes API Authentifiées
```
1. Service appelle API (ex: achatService.getAll())
2. authInterceptor intercepte la requête
3. Récupère le token via authService.getToken()
4. Ajoute header: Authorization: Bearer <token>
5. Requête envoyée au backend
6. Backend valide le token JWT
7. Response retournée
```

---

## 🧪 Test de l'Authentification

### Vérifier que tout fonctionne :

**1. Test Inscription**
```
1. Aller sur http://localhost:4200
2. Cliquer sur "Inscription"
3. Remplir le formulaire
4. Vérifier la redirection vers /dashboard
5. Vérifier que le nom s'affiche dans le header
```

**2. Test Connexion**
```
1. Se déconnecter
2. Aller sur http://localhost:4200/login
3. Entrer email et mot de passe
4. Vérifier la redirection vers /dashboard
```

**3. Test Protection des Routes**
```
1. Se déconnecter
2. Essayer d'accéder à http://localhost:4200/achats
3. Devrait être redirigé vers /login
```

**4. Test Persistance**
```
1. Se connecter
2. Rafraîchir la page (F5)
3. L'utilisateur devrait rester connecté
4. Vérifier localStorage dans DevTools (F12 → Application → Local Storage)
```

---

## 🛠️ Configuration Backend Requise

Votre backend Spring Boot doit :

### 1. Créer les Endpoints d'Authentification

**Controller :**
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        // Créer utilisateur
        // Générer token JWT
        // Retourner {user, token}
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        // Vérifier credentials
        // Générer token JWT
        // Retourner {user, token}
    }
}
```

### 2. Implémenter JWT

**Dependencies (pom.xml) :**
```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
</dependency>
```

### 3. Configurer Spring Security

**SecurityConfig :**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors()
            .and()
            .authorizeHttpRequests()
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

### 4. Créer JWT Filter

Le filtre doit :
- Extraire le token du header `Authorization: Bearer <token>`
- Valider le token JWT
- Extraire l'ID utilisateur du token
- Définir l'authentification dans le SecurityContext

---

## 📝 Points Importants

### ✅ Ce qui est Fait (Frontend)
- ✅ Formulaires d'inscription et connexion
- ✅ Validation côté client
- ✅ Stockage du token JWT
- ✅ Protection des routes
- ✅ Intercepteur pour ajouter le token aux requêtes
- ✅ Affichage dynamique du header
- ✅ Gestion de la déconnexion
- ✅ Utilisation de l'ID utilisateur dans les services

### ⚠️ Ce qu'il Reste à Faire (Backend)
- ⚠️ Créer les endpoints `/api/auth/register` et `/api/auth/login`
- ⚠️ Implémenter la génération de tokens JWT
- ⚠️ Créer le filtre JWT pour valider les tokens
- ⚠️ Configurer Spring Security
- ⚠️ Gérer les erreurs 401/403

---

## 🆘 Dépannage

### Erreur : "Impossible de contacter le serveur"
**Cause :** Les endpoints d'authentification n'existent pas encore côté backend
**Solution :** Implémenter les endpoints `/api/auth/register` et `/api/auth/login`

### Erreur : 401 Unauthorized sur les requêtes
**Cause :** Le token JWT n'est pas valide ou a expiré
**Solutions :**
1. Vérifier que le backend valide correctement le token
2. Vérifier que le token n'a pas expiré
3. Se reconnecter pour obtenir un nouveau token

### L'utilisateur est déconnecté après rafraîchissement
**Cause :** Le token n'est pas récupéré correctement du localStorage
**Solution :** Vérifier que le token est bien stocké (F12 → Application → Local Storage)

### Les routes ne sont pas protégées
**Cause :** Les guards ne sont pas correctement appliqués
**Solution :** Vérifier `app.routes.ts` et s'assurer que `canActivate: [authGuard]` est présent

---

## 📚 Ressources

- **JWT.io** : https://jwt.io (pour décoder et tester les tokens JWT)
- **Spring Security JWT** : https://spring.io/guides/tutorials/spring-boot-oauth2
- **Angular Guards** : https://angular.dev/guide/routing/common-router-tasks#preventing-unauthorized-access

---

**Version :** 1.0
**Date :** Octobre 2025
**Développé pour :** Dija Boutique 🌸
