# Test de l'upload de fichiers

## Vérifications à faire côté backend

### 1. Vérifier les logs du backend
Cherchez dans la console Spring Boot l'erreur exacte qui se produit lors de l'upload.

### 2. Vérifier que le dossier existe
Le backend doit créer automatiquement le dossier `uploads/photos/{tenant}/{type}`.
Vérifiez si ce dossier existe dans le répertoire du projet backend.

### 3. Vérifier le contrôleur
Le contrôleur `FileUploadController.java` devrait avoir cette signature :

```java
@PostMapping("/upload")
public ResponseEntity<Map<String, String>> uploadFile(
    @RequestParam("file") MultipartFile file,
    @RequestParam("type") String type,
    @AuthenticationPrincipal UserDetailsImpl userDetails
) {
    // ...
}
```

### 4. Test avec Postman/curl

Testez l'endpoint avec curl pour isoler le problème :

```bash
curl -X POST http://localhost:8080/api/files/upload \
  -H "Cookie: jwt=VOTRE_TOKEN_JWT" \
  -F "file=@/chemin/vers/image.jpg" \
  -F "type=achat"
```

### 5. Vérifications Spring Boot

Dans `application.properties` ou `application.yml`, vérifiez :

```properties
# Taille max des fichiers
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Dossier de stockage (optionnel)
file.upload.dir=uploads/photos
```

## Erreurs communes et solutions

### NullPointerException sur tenant
**Problème** : Le JWT ne contient pas l'information du tenant
**Solution** : Vérifiez que le JWT contient bien le claim `tenantId`

### NoSuchFileException
**Problème** : Le dossier de destination n'existe pas
**Solution** : Le backend doit créer automatiquement le dossier avec `Files.createDirectories()`

### AccessDeniedException (403)
**Problème** : L'utilisateur n'a pas le rôle ADMIN
**Solution** : Modifier SecurityConfig pour autoriser GERANT aussi

### MultipartException
**Problème** : Le fichier est trop volumineux ou mal formaté
**Solution** : Augmenter la taille max dans application.properties
