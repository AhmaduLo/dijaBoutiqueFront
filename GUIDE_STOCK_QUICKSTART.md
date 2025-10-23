# 🚀 Guide de Démarrage Rapide - Module Stock

## ⚡ Installation et Démarrage

### 1. Installer les dépendances (si ce n'est pas déjà fait)
```bash
npm install
```

### 2. Démarrer le serveur de développement
```bash
npm start
```
Ou :
```bash
ng serve
```

L'application sera accessible sur : `http://localhost:4200`

### 3. Démarrer le backend (dans un autre terminal)
Assurez-vous que votre backend Spring Boot est démarré sur `http://localhost:8080`

## 📋 Checklist Avant d'Utiliser le Module Stock

- [ ] Backend Spring Boot démarré
- [ ] Endpoints API disponibles :
  - [ ] `GET /api/stock`
  - [ ] `GET /api/stock/produit/{nom}`
  - [ ] `GET /api/stock/alertes`
  - [ ] `GET /api/stock/resume`
- [ ] Compte utilisateur créé
- [ ] Connexion réussie

## 🎯 Premier Accès au Module Stock

### Étape 1 : Se Connecter
1. Aller sur `http://localhost:4200`
2. Cliquer sur "Connexion"
3. Entrer vos identifiants
4. Cliquer sur "Se connecter"

### Étape 2 : Accéder au Module Stock
1. Dans le menu de navigation, cliquer sur "📦 Stock"
2. Le dashboard s'affiche avec :
   - 5 cartes de résumé en haut
   - Section d'alertes (si applicable)
   - Barre de recherche et filtres
   - Tableau complet du stock

### Étape 3 : Explorer les Fonctionnalités

#### Voir le Résumé Global
Les 5 cartes en haut affichent :
- **Total Produits** : Nombre de produits différents
- **En Stock** : Produits disponibles + quantités
- **Stock Bas** : Produits à commander bientôt
- **Rupture** : Produits en rupture
- **Valeur Stock** : Valeur totale + marge

#### Consulter les Alertes
Si des produits sont en rupture ou en stock bas, ils apparaissent dans la section "🔔 Alertes Stock"

#### Rechercher un Produit
1. Taper le nom du produit dans la barre de recherche
2. Les résultats se filtrent en temps réel

#### Filtrer par Statut
1. Ouvrir la liste déroulante "Tous les statuts"
2. Sélectionner :
   - "En stock" : Produits avec stock suffisant
   - "Stock bas" : Produits à commander
   - "Rupture" : Produits épuisés
   - "Négatif" : Erreurs de stock

#### Trier les Résultats
Choisir un critère de tri :
- **Par nom** : Ordre alphabétique
- **Stock (croissant)** : Du plus bas au plus haut
- **Stock (décroissant)** : Du plus haut au plus bas
- **Valeur (décroissant)** : Produits les plus chers d'abord
- **Marge (décroissant)** : Produits les plus rentables d'abord

#### Actualiser les Données
Cliquer sur "🔄 Actualiser" pour recharger les données du serveur

## 📊 Comprendre le Tableau

### Colonnes Disponibles

| Colonne | Description | Utilité |
|---------|-------------|---------|
| **Produit** | Nom du produit | Identification |
| **Acheté** | Quantité totale achetée | Historique |
| **Vendu** | Quantité totale vendue | Performance |
| **Stock** | Quantité disponible + barre | État actuel |
| **Prix Achat** | Prix moyen d'achat | Coût |
| **Prix Vente** | Prix moyen de vente | Revenu |
| **Valeur** | Stock × Prix achat | Investissement |
| **Marge** | Prix vente - Prix achat | Rentabilité |
| **Rotation** | % vendu/acheté | Popularité |
| **Statut** | Badge coloré | État visuel |

### Codes Couleur des Statuts

- 🟢 **Vert** (En stock) : Tout va bien
- 🟠 **Orange** (Stock bas) : À surveiller, commander bientôt
- 🔴 **Rouge** (Rupture) : Plus de stock, commander urgent
- ⚫ **Rouge foncé** (Négatif) : Erreur de données

### Barre de Progression
La barre sous chaque stock indique le pourcentage disponible :
- **Barre pleine** : Stock complet
- **Barre à moitié** : 50% du stock utilisé
- **Barre vide** : Rupture

## 🎓 Cas d'Usage Pratiques

### Cas 1 : Identifier les Produits à Commander
**Objectif** : Savoir quoi commander aux fournisseurs

**Étapes** :
1. Aller sur "📦 Stock"
2. Regarder la carte "Stock Bas" (ex: 5 produits)
3. Cliquer sur "Tous les statuts" → "Stock bas"
4. Le tableau affiche les 5 produits
5. Noter les noms et quantités
6. Passer les commandes aux fournisseurs

### Cas 2 : Calculer la Valeur de l'Inventaire
**Objectif** : Connaître la valeur totale du stock

**Étapes** :
1. Aller sur "📦 Stock"
2. Regarder la carte "Valeur Stock"
3. Voir le montant total (ex: 15 000 €)
4. Voir la marge globale potentielle (ex: 5 000 €)

### Cas 3 : Trouver les Produits les Plus Rentables
**Objectif** : Identifier les meilleurs produits

**Étapes** :
1. Aller sur "📦 Stock"
2. Cliquer sur "Trier par nom" → "Marge (décroissant)"
3. Le tableau affiche les produits avec la marge la plus élevée en premier
4. Concentrer les efforts de vente sur ces produits

### Cas 4 : Vérifier le Stock d'un Produit Spécifique
**Objectif** : Savoir combien il reste d'un produit

**Étapes** :
1. Aller sur "📦 Stock"
2. Taper le nom du produit dans la recherche (ex: "Collier")
3. Le tableau affiche uniquement ce produit
4. Voir le stock disponible (ex: 12 unités)

### Cas 5 : Analyser la Rotation des Produits
**Objectif** : Voir quels produits se vendent le mieux

**Étapes** :
1. Aller sur "📦 Stock"
2. Regarder la colonne "Rotation"
3. **100%** = Tout vendu (excellent)
4. **50%** = Moitié vendue (correct)
5. **10%** = Peu vendu (à surveiller)

## 🔧 Résolution de Problèmes Courants

### Problème 1 : Page Blanche / Rien ne s'Affiche
**Causes possibles** :
- Backend non démarré
- Erreur de connexion
- Pas authentifié

**Solutions** :
1. Vérifier que le backend est démarré (`http://localhost:8080`)
2. Ouvrir la console du navigateur (F12) → Onglet "Console"
3. Voir les erreurs en rouge
4. Se reconnecter si nécessaire

### Problème 2 : "Aucun produit trouvé"
**Causes possibles** :
- Base de données vide
- Filtres trop restrictifs
- Pas de données en backend

**Solutions** :
1. Vérifier les filtres (recherche, statut)
2. Cliquer sur "🔄 Actualiser"
3. Vérifier que des achats/ventes ont été enregistrés
4. Contacter l'administrateur si le problème persiste

### Problème 3 : Données Incorrectes
**Causes possibles** :
- Cache navigateur
- Données backend obsolètes

**Solutions** :
1. Cliquer sur "🔄 Actualiser"
2. Vider le cache du navigateur (Ctrl+Shift+Delete)
3. Actualiser la page (F5)
4. Redémarrer le backend si nécessaire

### Problème 4 : Tableau Tronqué sur Mobile
**Solution** :
- Le tableau est scrollable horizontalement
- Swiper vers la gauche/droite pour voir toutes les colonnes
- Utiliser le mode paysage pour plus de confort

## 📱 Utilisation sur Mobile

### Optimisations Mobiles
- Cartes empilées verticalement
- Tableau scrollable horizontalement
- Boutons et textes adaptés
- Barre de recherche pleine largeur

### Conseils Mobile
1. Tourner l'écran en paysage pour le tableau
2. Utiliser le zoom si nécessaire
3. Swiper pour voir toutes les colonnes
4. Filtrer pour réduire les résultats

## 🎨 Personnalisation (Développeurs)

### Changer l'URL de l'API
Éditer `src/app/core/services/stock.service.ts` ligne 13 :
```typescript
private readonly API_URL = 'http://localhost:8080/api/stock';
```

### Modifier les Couleurs
Éditer `src/app/features/stock/stock-dashboard.component.scss`

### Ajouter une Colonne
Éditer `src/app/features/stock/stock-dashboard.component.ts` dans la section template

## 📞 Support

### En Cas de Problème
1. **Vérifier** : Backend démarré, connecté
2. **Actualiser** : Cliquer sur "🔄 Actualiser"
3. **Console** : Ouvrir F12 → Console pour voir les erreurs
4. **Documentation** : Lire `STOCK_README.md`
5. **Support** : Contacter l'équipe de développement

### Informations Utiles pour le Support
Fournir :
- Message d'erreur exact
- Capture d'écran
- Étapes pour reproduire
- Version du navigateur
- État du backend (démarré/arrêté)

## ✅ Checklist de Test

Tester que tout fonctionne :
- [ ] Les 5 cartes affichent des chiffres corrects
- [ ] Les alertes apparaissent (si applicable)
- [ ] La recherche filtre correctement
- [ ] Les filtres de statut fonctionnent
- [ ] Le tri change l'ordre des lignes
- [ ] Les couleurs correspondent aux statuts
- [ ] Les barres de progression sont visibles
- [ ] Le bouton "Actualiser" recharge les données
- [ ] Le tableau est scrollable
- [ ] Responsive sur mobile

## 🎉 Prochaines Étapes

Après avoir maîtrisé le module Stock :
1. Explorer le module "📈 Rapports" pour des analyses
2. Créer des achats dans "🛒 Achats"
3. Enregistrer des ventes dans "💰 Ventes"
4. Le stock se met à jour automatiquement

## 💡 Astuces

- **Raccourci** : Marquer la page en favori
- **Productivité** : Utiliser les filtres pour voir uniquement ce qui vous intéresse
- **Veille** : Consulter régulièrement les alertes
- **Optimisation** : Trier par "Rotation" pour identifier les produits à promouvoir

---

**Bon usage du module Stock !** 🎊

Pour plus d'informations, consulter `STOCK_README.md`
