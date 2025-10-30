/**
 * Configuration pour l'environnement de production
 * IMPORTANT: Modifier apiUrl avec l'URL de production avant le déploiement
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.dijaboutique.com/api',  // À modifier avec votre domaine
  enableLogging: false,  // Désactiver les logs en production
  enableDebug: false     // Désactiver le debug en production
};
