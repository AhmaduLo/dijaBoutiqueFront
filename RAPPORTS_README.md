# Module de Rapports et Bilans

## Vue d'ensemble

Le module de rapports fournit une analyse complète de l'activité de la boutique avec des statistiques détaillées, des tendances et des visualisations.

## Fonctionnalités

### 1. Types de rapports disponibles

- **Rapport Mensuel** : Analyse détaillée d'un mois spécifique
- **Rapport Trimestriel** : Vue d'ensemble du trimestre en cours
- **Rapport Annuel** : Bilan complet de l'année
- **Période Personnalisée** : Sélection libre de dates de début et fin

### 2. Métriques calculées

Le rapport calcule automatiquement :

- **Chiffre d'Affaires** : Total des ventes sur la période
- **Total Achats** : Total des achats de stock
- **Total Dépenses** : Somme de toutes les dépenses
- **Bénéfice Net** : CA - Achats - Dépenses
- **Marge Brute** : ((CA - Achats) / CA) × 100
- **Marge Nette** : (Bénéfice Net / CA) × 100
- **Moyennes par transaction** : Pour achats, ventes et dépenses

### 3. Visualisations

#### Évolution mensuelle
Tableau détaillé montrant mois par mois :
- Chiffre d'affaires
- Total achats
- Total dépenses
- Bénéfice net
- Marge brute

#### Tendances
Calcul des évolutions en pourcentage :
- Évolution du CA
- Évolution du bénéfice
- Évolution des dépenses

#### Répartition des dépenses
Graphiques à barres montrant la distribution des dépenses par catégorie avec pourcentages.

### 4. Analyses et recommandations

Le système génère automatiquement des conseils basés sur :
- Le bénéfice net (positif/négatif)
- La marge brute (faible/excellente)
- L'évolution des dépenses

### 5. Export de données

Trois formats d'export disponibles :

#### PDF (Recommandé)
- Document professionnel avec mise en page soignée
- En-tête avec titre et période
- Sections organisées : Métriques principales, Statistiques des transactions, Tendances, Évolution mensuelle, Dépenses par catégorie
- Tableaux formatés avec couleurs de marque
- Pagination automatique
- Pied de page avec numéro de page et date de génération
- Idéal pour l'impression et le partage

#### CSV
- Structure tabulaire pour Excel/Google Sheets
- Sections : Métriques générales, Évolution mensuelle, Dépenses par catégorie

#### JSON
- Format structuré pour analyse programmatique
- Données complètes incluant tous les calculs

## Architecture technique

### Modèles de données

**`RapportPeriode`**
```typescript
{
  dateDebut: string;
  dateFin: string;
  totalAchats: number;
  chiffreAffaires: number;
  totalDepenses: number;
  beneficeNet: number;
  margeBrute: number;
  margeNette: number;
  nombreAchats: number;
  nombreVentes: number;
  nombreDepenses: number;
  // ...moyennes
}
```

**`RapportMensuel`**
```typescript
{
  mois: string;
  annee: number;
  totalAchats: number;
  chiffreAffaires: number;
  totalDepenses: number;
  beneficeNet: number;
  margeBrute: number;
}
```

**`RapportComplet`**
```typescript
{
  periode: RapportPeriode;
  evolutionMensuelle: RapportMensuel[];
  depensesParCategorie: StatistiquesCategories[];
  tendances: {
    evolutionCA: number;
    evolutionBenefice: number;
    evolutionDepenses: number;
  };
}
```

### Services

**`RapportService`** (`src/app/core/services/rapport.service.ts`)

Principales méthodes :

- `genererRapportPeriode(dateDebut, dateFin)` : Génère un rapport pour une période
- `genererRapportMensuel(mois, annee)` : Rapport pour un mois spécifique
- `genererRapportAnnuel(annee)` : Rapport annuel avec évolution mensuelle
- `genererRapportComplet(filtre)` : Rapport complet avec toutes les statistiques
- `exporterPDF(rapport, nomFichier)` : Export au format PDF professionnel
- `exporterCSV(rapport, nomFichier)` : Export au format CSV
- `exporterJSON(rapport, nomFichier)` : Export au format JSON

**Bibliothèques utilisées :**
- `jsPDF` : Génération de documents PDF
- `jspdf-autotable` : Création de tableaux dans les PDF

### Composant

**`RapportsComponent`** (`src/app/features/rapports/`)

Structure :
- **Filtres** : Sélection du type de rapport et des périodes
- **Métriques** : Cartes de métriques principales (réutilise MetricCardComponent)
- **Résumé** : Grille de statistiques détaillées
- **Tendances** : Évolutions en pourcentage
- **Évolution mensuelle** : Tableau chronologique
- **Dépenses par catégorie** : Visualisation en barres
- **Analyses** : Recommandations automatiques

## Utilisation

1. Naviguer vers la page "Rapports et Bilans"
2. Sélectionner le type de rapport souhaité
3. Choisir la période (mois/année ou dates personnalisées)
4. Cliquer sur "Générer le rapport"
5. Consulter les analyses
6. Exporter en PDF (recommandé), CSV ou JSON selon vos besoins

## Exemples de cas d'usage

### Bilan mensuel
```
Type: Rapport Mensuel
Mois: Octobre
Année: 2025
→ Génère un rapport pour octobre 2025
```

### Analyse trimestrielle
```
Type: Rapport Trimestriel
→ Génère automatiquement le rapport du trimestre en cours
```

### Comparaison personnalisée
```
Type: Période Personnalisée
Date début: 2025-01-01
Date fin: 2025-06-30
→ Génère un rapport pour le premier semestre 2025
```

## Intégration avec le backend

Le service de rapports s'appuie sur les endpoints existants :

- `AchatService.getStatistiques(dateDebut, dateFin)`
- `VenteService.getStatistiques(dateDebut, dateFin)`
- `DepenseService.getTotal(dateDebut, dateFin)`
- `DepenseService.getStatistiques(dateDebut, dateFin)`

Aucune modification backend n'est nécessaire.

## Performance

- Utilisation de `forkJoin` pour paralléliser les requêtes
- Calculs optimisés côté client
- Indicateur de chargement pendant la génération
- Exports asynchrones sans blocage de l'interface

## Responsive Design

Le composant est entièrement responsive :
- Grilles adaptatives
- Tableaux scrollables sur mobile
- Boutons pleine largeur sur petits écrans
- Typographie ajustée

## Fonctionnalités implémentées

✅ Export PDF avec mise en page professionnelle
✅ Export CSV pour analyse Excel
✅ Export JSON pour intégrations
✅ Rapports mensuels, trimestriels et annuels
✅ Périodes personnalisées
✅ Évolution mensuelle détaillée
✅ Répartition des dépenses par catégorie
✅ Analyses et recommandations automatiques
✅ Interface responsive

## Futures améliorations possibles

1. Graphiques interactifs (Chart.js, D3.js)
2. Comparaison de plusieurs périodes côte à côte
3. Prévisions basées sur les tendances
4. Rapports programmés par email
5. Filtres avancés (par produit, par catégorie)
6. Tableaux de bord personnalisables
7. Export Excel (.xlsx) natif
8. Ajout de notes et commentaires personnalisés

## Support

Pour toute question ou suggestion d'amélioration, contactez l'équipe de développement.
