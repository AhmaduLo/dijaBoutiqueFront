/**
 * Modèle représentant une entreprise (tenant)
 */
export interface Tenant {
  tenantUuid: string;
  nomEntreprise: string;
  adresse?: string;
  numeroTelephone: string;
}

/**
 * DTO pour mettre à jour une entreprise
 */
export interface UpdateTenantDto {
  nomEntreprise: string;
  adresse?: string;
  numeroTelephone: string;
}
