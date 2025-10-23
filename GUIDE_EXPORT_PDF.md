# Guide d'Export PDF des Rapports

## Comment générer un rapport PDF

### Étape 1 : Générer le rapport

1. Ouvrez l'application et connectez-vous
2. Naviguez vers **"Rapports et Bilans"** dans le menu
3. Sélectionnez le **type de rapport** :
   - Rapport Mensuel
   - Rapport Trimestriel
   - Rapport Annuel
   - Période Personnalisée
4. Configurez la période souhaitée
5. Cliquez sur **"🔍 Générer le rapport"**

### Étape 2 : Exporter en PDF

Une fois le rapport généré :
1. Cliquez sur le bouton **"📑 Exporter PDF"** en haut à droite
2. Le PDF se téléchargera automatiquement dans votre dossier de téléchargements
3. Le fichier sera nommé : `rapport_[type]_[date].pdf`
   - Exemple : `rapport_mensuel_2025-10-23.pdf`

## Contenu du PDF

Le document PDF généré contient les sections suivantes :

### 📋 En-tête
- Titre du rapport
- Période analysée
- Ligne de séparation colorée

### 📊 Métriques Principales
Tableau avec :
- Chiffre d'Affaires
- Total Achats
- Total Dépenses
- Bénéfice Net
- Marge Brute
- Marge Nette

### 📈 Statistiques des Transactions
Tableau avec :
- Nombre d'achats, ventes et dépenses
- Moyennes par transaction

### 📉 Tendances (si disponibles)
- Évolution du Chiffre d'Affaires (%)
- Évolution du Bénéfice (%)
- Évolution des Dépenses (%)

### 📅 Évolution Mensuelle
Tableau détaillé avec :
- Mois
- CA, Achats, Dépenses
- Bénéfice Net
- Marge Brute

### 💰 Répartition des Dépenses
Tableau par catégorie :
- Nom de la catégorie
- Montant en FCFA
- Pourcentage du total

### 📄 Pied de page
- Numéro de page
- Date de génération

## Caractéristiques du PDF

### Format
- **Format** : A4 (210 x 297 mm)
- **Orientation** : Portrait
- **Marges** : 20mm de chaque côté

### Design
- **Couleurs** : Utilise les couleurs de marque de l'application (rose #C2185B)
- **Police** : Police système claire et lisible
- **Tableaux** : Alternance de couleurs pour faciliter la lecture

### Pagination
- Pagination automatique si le contenu dépasse une page
- Numéro de page au format "Page X sur Y"

## Cas d'usage

### 📋 Pour une présentation
- Générez un rapport mensuel ou annuel
- Exportez en PDF
- Utilisez-le pour vos présentations aux partenaires ou investisseurs

### 📊 Pour l'archivage
- Générez des rapports périodiques
- Exportez en PDF pour conserver un historique
- Classez par date pour un suivi chronologique

### 💼 Pour la comptabilité
- Générez un rapport annuel
- Exportez en PDF
- Fournissez-le à votre comptable ou expert-comptable

### 📈 Pour l'analyse
- Générez plusieurs rapports pour différentes périodes
- Comparez les PDF pour identifier les tendances
- Utilisez-les pour prendre des décisions stratégiques

## Conseils d'utilisation

### ✅ À faire
- Générez des rapports régulièrement (mensuels recommandés)
- Archivez les PDF pour garder un historique
- Utilisez des noms de fichiers explicites si vous les renommez
- Imprimez le PDF pour vos archives physiques si nécessaire

### ❌ À éviter
- Ne générez pas de rapports pour des périodes sans données
- N'ouvrez pas le PDF avant que le téléchargement soit terminé
- Évitez de générer trop de rapports simultanément

## Dépannage

### Le PDF ne se télécharge pas
1. Vérifiez que le rapport est bien généré avant d'exporter
2. Vérifiez les paramètres de votre navigateur pour les téléchargements
3. Autorisez les téléchargements depuis l'application
4. Essayez avec un autre navigateur

### Le PDF est vide ou incomplet
1. Vérifiez que la période sélectionnée contient des données
2. Attendez que le rapport soit complètement généré
3. Réessayez la génération du rapport

### Le PDF ne s'ouvre pas
1. Vérifiez que vous avez un lecteur PDF installé
2. Essayez d'ouvrir le PDF avec un autre lecteur (Adobe Reader, navigateur web, etc.)
3. Vérifiez que le téléchargement n'a pas été interrompu

## Exemples de fichiers PDF générés

### Rapport Mensuel (Octobre 2025)
```
Nom du fichier : rapport_mensuel_2025-10-23.pdf
Contenu :
- Métriques d'octobre 2025
- 1 mois d'évolution
- Dépenses par catégorie
Pages : 2-3 pages typiquement
```

### Rapport Annuel (2025)
```
Nom du fichier : rapport_annuel_2025-10-23.pdf
Contenu :
- Métriques de toute l'année 2025
- 12 mois d'évolution
- Tendances sur l'année
- Dépenses par catégorie
Pages : 3-4 pages typiquement
```

### Période Personnalisée (Q1 2025)
```
Nom du fichier : rapport_personnalise_2025-10-23.pdf
Contenu :
- Métriques du 01/01/2025 au 31/03/2025
- 3 mois d'évolution
- Tendances sur le trimestre
- Dépenses par catégorie
Pages : 2-3 pages typiquement
```

## Technologies utilisées

- **jsPDF** : Bibliothèque JavaScript pour la génération de PDF
- **jspdf-autotable** : Extension pour créer des tableaux formatés
- **Avantages** :
  - Génération côté client (rapide, pas de requête serveur)
  - Personnalisation complète du design
  - Compatibilité avec tous les navigateurs modernes

## Support

Pour toute question concernant l'export PDF, consultez :
- La documentation principale : `RAPPORTS_README.md`
- L'équipe de support technique

---

**Dernière mise à jour** : 23 octobre 2025
**Version** : 1.0.0
