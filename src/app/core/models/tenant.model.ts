/**
 * Modèle représentant une entreprise (tenant)
 */
export interface Tenant {
  tenantUuid: string;
  nomEntreprise: string;
  adresse?: string;
  numeroTelephone: string;
  nineaSiret?: string;           // Numéro NINEA (Sénégal) ou SIRET (France) - optionnel
  nomProprietaire?: string;      // Nom de l'administrateur propriétaire
  prenomProprietaire?: string;   // Prénom de l'administrateur propriétaire
  emailProprietaire?: string;    // Email de l'administrateur propriétaire
}

/**
 * DTO pour mettre à jour une entreprise
 */
export interface UpdateTenantDto {
  nomEntreprise: string;
  adresse?: string;
  numeroTelephone: string;
  nineaSiret?: string;           // Numéro NINEA (Sénégal) ou SIRET (France) - optionnel
}
