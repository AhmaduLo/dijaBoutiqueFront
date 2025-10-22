# 📘 Guide d'Utilisation - Dija Boutique

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend (Spring Boot)
Assurez-vous que votre API Spring Boot est lancée sur `http://localhost:8080`

### 2. Démarrer l'Application Frontend

```bash
cd frontdijaBoutique
npm install    # Première fois seulement
npm start
```

L'application s'ouvrira automatiquement sur **http://localhost:4200**

---

## 🎯 Utilisation de l'Application

### 📊 **Dashboard (Tableau de bord)**

**Accès :** Page d'accueil par défaut

**Fonctionnalités :**
- 4 cartes métriques principales :
  * 🛒 **Total Achats** : Somme de tous vos achats de stock
  * 💰 **Chiffre d'Affaires** : Total des ventes
  * 💳 **Total Dépenses** : Somme de toutes les dépenses
  * 📊 **Bénéfice Net** : Ventes - Achats - Dépenses

**Sélecteur de période :**
- Mois en cours (par défaut)
- Mois dernier
- Trimestre en cours
- Année en cours
- Personnalisée (choisissez vos dates)

**Résumé détaillé :**
- Marge brute (%)
- Nombre de transactions par type
- Conseils automatiques basés sur vos résultats

---

### 🛒 **Gestion des Achats**

**Accès :** Menu "Achats" dans l'en-tête

**Ajouter un achat :**
1. Cliquez sur "+ Nouvel achat"
2. Remplissez le formulaire :
   - Nom du produit (ex: Collier doré)
   - Fournisseur (ex: Fournisseur Paris)
   - Quantité
   - Prix unitaire (€)
   - Date d'achat
3. Le **prix total** est calculé automatiquement
4. Cliquez sur "Ajouter"

**Rechercher :**
- Utilisez la barre de recherche pour filtrer par nom de produit ou fournisseur

**Modifier/Supprimer :**
- Cliquez sur ✏️ pour modifier
- Cliquez sur 🗑️ pour supprimer (avec confirmation)

**Vue d'ensemble :**
- Tableau récapitulatif avec toutes les informations
- Total automatique en bas du tableau

---

### 💰 **Gestion des Ventes**

**Accès :** Menu "Ventes" dans l'en-tête

**Fonctionnement identique aux achats :**
1. "+ Nouvelle vente"
2. Remplissez :
   - Nom du produit
   - Client
   - Quantité
   - Prix unitaire (€)
   - Date de vente
3. Prix total calculé automatiquement
4. Sauvegardez

**Recherche :** Par nom de produit ou client

---

### 💳 **Gestion des Dépenses**

**Accès :** Menu "Dépenses" dans l'en-tête

**Ajouter une dépense :**
1. Cliquez sur "+ Nouvelle dépense"
2. Remplissez :
   - **Libellé** (ex: Loyer local commercial)
   - **Catégorie** (choisir parmi 14 catégories)
   - **Montant** (€)
   - **Date**
   - **Dépense récurrente** (cocher si applicable)
   - **Notes** (optionnel)
3. Enregistrez

**Catégories disponibles :**
- Loyer
- Électricité
- Eau
- Internet
- Transport
- Marketing
- Fournitures
- Maintenance
- Salaires
- Assurance
- Taxes
- Formation
- Équipement
- Autre

**Filtres :**
- Recherche par libellé
- Filtre par catégorie
- Badge 🔁 pour les dépenses récurrentes

---

### 📈 **Rapports (En développement)**

**Accès :** Menu "Rapports" dans l'en-tête

Cette fonctionnalité est en cours de développement.
En attendant, utilisez le **Dashboard** pour vos statistiques.

**À venir :**
- Graphiques d'évolution temporelle
- Bilans mensuels détaillés
- Export PDF
- Comparaisons entre périodes

---

## 💡 Conseils d'Utilisation

### ✅ Bonnes Pratiques

1. **Enregistrez régulièrement vos transactions**
   - Idéalement chaque jour
   - Gardez vos tickets/factures à portée de main

2. **Utilisez les catégories de dépenses correctement**
   - Cela facilite l'analyse et les rapports
   - Marquez les dépenses récurrentes (loyer, abonnements)

3. **Consultez le Dashboard chaque semaine**
   - Suivez votre marge brute
   - Vérifiez que votre bénéfice est positif
   - Ajustez vos prix si nécessaire

4. **Utilisez les filtres de période**
   - Comparez vos performances mensuelles
   - Identifiez les saisons creuses/hautes

### ⚠️ Points d'Attention

- **Calcul de la marge brute :** `(Ventes - Achats) / Ventes × 100`
  - Une marge < 30% est faible
  - Visez au moins 40-50% pour une bonne rentabilité

- **Bénéfice Net :** `Ventes - Achats - Dépenses`
  - Doit être positif pour que l'activité soit rentable
  - Si négatif : réduisez les dépenses ou augmentez les prix

---

## 🎨 Interface

### Navigation

**En-tête :**
- Logo "✨ Dija Boutique"
- Menu de navigation (Dashboard, Achats, Ventes, Dépenses, Rapports)
- Indicateur utilisateur

**Notifications :**
- Les messages de succès/erreur apparaissent en haut à droite
- Cliquables pour les fermer
- Disparaissent automatiquement après quelques secondes

### Thème Visuel

- **Couleurs principales :** Rose poudré, beige, or
- **Design féminin et élégant**
- **Interface intuitive et épurée**
- **Responsive** : fonctionne sur mobile, tablette et desktop

---

## 🆘 Dépannage

### Erreur : "Impossible de contacter le serveur"

**Cause :** Le backend Spring Boot n'est pas démarré

**Solution :**
1. Vérifiez que votre API tourne sur `http://localhost:8080`
2. Testez l'URL dans votre navigateur : `http://localhost:8080/api/achats`
3. Redémarrez le backend si nécessaire

### Page blanche ou erreurs de chargement

**Solution :**
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs
3. Essayez de rafraîchir la page (Ctrl+F5)
4. Redémarrez le serveur Angular (`Ctrl+C` puis `npm start`)

### Les modifications ne s'affichent pas

**Solution :**
1. Le serveur Angular recharge automatiquement
2. Attendez quelques secondes
3. Rafraîchissez le navigateur
4. Vérifiez qu'il n'y a pas d'erreurs dans le terminal

---

## 📊 Exemple d'Utilisation Journalière

### Routine Quotidienne Recommandée

**Matin :**
1. Ouvrez l'application
2. Consultez le Dashboard
3. Vérifiez vos métriques de la veille

**Après chaque vente :**
1. Allez dans "Ventes"
2. Ajoutez la vente (produit, client, montant)
3. Vérifiez que tout est enregistré

**Réception de stock :**
1. Allez dans "Achats"
2. Enregistrez le nouvel achat
3. Notez le fournisseur et le prix unitaire

**Paiement d'une dépense :**
1. Allez dans "Dépenses"
2. Enregistrez la dépense
3. Choisissez la bonne catégorie
4. Cochez "récurrente" si applicable

**Fin de semaine :**
1. Dashboard → Consultez vos résultats hebdomadaires
2. Analysez votre marge et votre bénéfice
3. Prenez des décisions pour la semaine suivante

---

## 🔐 Sécurité & Données

- **Données stockées :** Base de données Spring Boot (côté serveur)
- **Utilisateur actuel :** ID fixe à 1 (authentification à venir)
- **Connexion :** HTTP locale (localhost uniquement)
- **Backup :** Pensez à sauvegarder votre base de données régulièrement

---

## 📞 Support

Pour toute question ou problème :
1. Consultez d'abord ce guide
2. Vérifiez le fichier `README_DIJA.md`
3. Consultez les logs dans le terminal
4. Vérifiez la console du navigateur (F12)

---

**Version :** 1.0
**Dernière mise à jour :** Octobre 2025
**Application développée pour Dija Boutique** 🌸
