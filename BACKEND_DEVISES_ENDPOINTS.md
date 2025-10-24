# 🔧 Endpoints Backend pour la Gestion des Devises

## 📋 Contexte

Le frontend Angular est prêt pour gérer les devises, mais le backend Spring Boot doit implémenter les endpoints suivants pour que tout fonctionne.

## 🚀 Endpoints à Créer

### 1. **GET /api/devises** - Lister toutes les devises

**Description** : Récupère la liste complète des devises configurées

**Réponse** (200 OK) :
```json
[
  {
    "id": 1,
    "code": "XOF",
    "nom": "Franc CFA",
    "symbole": "CFA",
    "pays": "Sénégal",
    "tauxChange": 1.0,
    "isDefault": true,
    "dateCreation": "2025-01-15T10:30:00"
  },
  {
    "id": 2,
    "code": "EUR",
    "nom": "Euro",
    "symbole": "€",
    "pays": "France",
    "tauxChange": 655.957,
    "isDefault": false,
    "dateCreation": "2025-01-15T10:31:00"
  }
]
```

---

### 2. **POST /api/devises** - Créer une nouvelle devise

**Description** : Crée une nouvelle devise dans le système

**Corps de la requête** :
```json
{
  "code": "USD",
  "nom": "Dollar américain",
  "symbole": "$",
  "pays": "États-Unis",
  "tauxChange": 600.0,
  "isDefault": false
}
```

**Réponse** (201 Created) :
```json
{
  "id": 3,
  "code": "USD",
  "nom": "Dollar américain",
  "symbole": "$",
  "pays": "États-Unis",
  "tauxChange": 600.0,
  "isDefault": false,
  "dateCreation": "2025-01-15T11:00:00"
}
```

**Erreurs possibles** :
- 400 Bad Request : Données invalides
- 409 Conflict : Code devise déjà existant

---

### 3. **GET /api/devises/:id** - Récupérer une devise

**Description** : Récupère les détails d'une devise spécifique

**Paramètres** :
- `id` (path) : ID de la devise

**Réponse** (200 OK) :
```json
{
  "id": 1,
  "code": "XOF",
  "nom": "Franc CFA",
  "symbole": "CFA",
  "pays": "Sénégal",
  "tauxChange": 1.0,
  "isDefault": true,
  "dateCreation": "2025-01-15T10:30:00"
}
```

**Erreurs** :
- 404 Not Found : Devise introuvable

---

### 4. **PUT /api/devises/:id** - Modifier une devise

**Description** : Met à jour les informations d'une devise

**Paramètres** :
- `id` (path) : ID de la devise

**Corps de la requête** :
```json
{
  "code": "XOF",
  "nom": "Franc CFA (BCEAO)",
  "symbole": "CFA",
  "pays": "Sénégal",
  "tauxChange": 1.0,
  "isDefault": true
}
```

**Réponse** (200 OK) :
```json
{
  "id": 1,
  "code": "XOF",
  "nom": "Franc CFA (BCEAO)",
  "symbole": "CFA",
  "pays": "Sénégal",
  "tauxChange": 1.0,
  "isDefault": true,
  "dateCreation": "2025-01-15T10:30:00"
}
```

**Erreurs** :
- 404 Not Found : Devise introuvable
- 400 Bad Request : Données invalides

---

### 5. **DELETE /api/devises/:id** - Supprimer une devise

**Description** : Supprime une devise (impossible si c'est la devise par défaut)

**Paramètres** :
- `id` (path) : ID de la devise

**Réponse** (204 No Content) : Pas de corps de réponse

**Erreurs** :
- 404 Not Found : Devise introuvable
- 400 Bad Request : Impossible de supprimer la devise par défaut
- 409 Conflict : La devise est utilisée dans des transactions

---

### 6. **GET /api/devises/default** - Récupérer la devise par défaut

**Description** : Récupère la devise définie comme devise par défaut du système

**Réponse** (200 OK) :
```json
{
  "id": 1,
  "code": "XOF",
  "nom": "Franc CFA",
  "symbole": "CFA",
  "pays": "Sénégal",
  "tauxChange": 1.0,
  "isDefault": true,
  "dateCreation": "2025-01-15T10:30:00"
}
```

**Erreurs** :
- 404 Not Found : Aucune devise par défaut définie

---

### 7. **PUT /api/devises/:id/set-default** - Définir comme devise par défaut

**Description** : Marque une devise comme devise par défaut (et retire ce statut des autres)

**Paramètres** :
- `id` (path) : ID de la devise à définir par défaut

**Réponse** (200 OK) :
```json
{
  "id": 2,
  "code": "EUR",
  "nom": "Euro",
  "symbole": "€",
  "pays": "France",
  "tauxChange": 655.957,
  "isDefault": true,
  "dateCreation": "2025-01-15T10:31:00"
}
```

**Erreurs** :
- 404 Not Found : Devise introuvable

---

## 🗄️ Modèle de Données (Entity JPA)

```java
@Entity
@Table(name = "devises")
public class Devise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 10)
    private String code;  // USD, EUR, XOF

    @Column(nullable = false)
    private String nom;  // Dollar américain

    @Column(nullable = false, length = 10)
    private String symbole;  // $, €, CFA

    @Column(nullable = false)
    private String pays;  // États-Unis

    @Column(nullable = false)
    private Double tauxChange = 1.0;  // Taux par rapport à devise de référence

    @Column(nullable = false)
    private Boolean isDefault = false;  // Une seule devise peut être par défaut

    @Column(nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    // Getters et Setters
}
```

## 🔐 Sécurité

Tous les endpoints doivent être protégés et accessibles **uniquement aux utilisateurs avec le rôle ADMIN**.

```java
@PreAuthorize("hasRole('ADMIN')")
```

## 🎯 Règles Métier

1. **Code unique** : Le code de devise doit être unique (ex: un seul "USD")
2. **Une seule devise par défaut** : Quand on définit une devise par défaut, retirer ce statut des autres
3. **Protection de la devise par défaut** : Impossible de la supprimer
4. **Taux de change positif** : Le taux doit être > 0
5. **Devise de référence** : Généralement, la devise par défaut a un taux de 1.0

## 📝 DTOs Recommandés

### CreateDeviseDto
```java
public class CreateDeviseDto {
    @NotBlank
    @Size(max = 10)
    private String code;

    @NotBlank
    private String nom;

    @NotBlank
    @Size(max = 10)
    private String symbole;

    @NotBlank
    private String pays;

    @Positive
    private Double tauxChange = 1.0;

    private Boolean isDefault = false;

    // Getters et Setters
}
```

### UpdateDeviseDto
```java
public class UpdateDeviseDto {
    private String code;
    private String nom;
    private String symbole;
    private String pays;

    @Positive
    private Double tauxChange;

    private Boolean isDefault;

    // Getters et Setters
}
```

## 🧪 Tests avec Postman/cURL

### Créer une devise
```bash
curl -X POST http://localhost:8080/api/devises \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "USD",
    "nom": "Dollar américain",
    "symbole": "$",
    "pays": "États-Unis",
    "tauxChange": 600.0,
    "isDefault": false
  }'
```

### Lister les devises
```bash
curl -X GET http://localhost:8080/api/devises \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Définir comme devise par défaut
```bash
curl -X PUT http://localhost:8080/api/devises/2/set-default \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ✅ Checklist Backend

- [ ] Créer l'entité `Devise` avec JPA
- [ ] Créer le repository `DeviseRepository`
- [ ] Créer les DTOs (`CreateDeviseDto`, `UpdateDeviseDto`)
- [ ] Créer le service `DeviseService` avec la logique métier
- [ ] Créer le controller `DeviseController` avec les 7 endpoints
- [ ] Ajouter la sécurité (@PreAuthorize ADMIN)
- [ ] Gérer les contraintes (code unique, devise par défaut unique)
- [ ] Tester tous les endpoints
- [ ] Ajouter des données de test (seeds)

---

Une fois ces endpoints implémentés, le frontend fonctionnera automatiquement ! 🚀
