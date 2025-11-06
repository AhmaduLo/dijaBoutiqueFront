import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tenant, UpdateTenantDto } from '../models/tenant.model';

/**
 * Service de gestion des entreprises (tenants)
 */
@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private readonly API_URL = 'http://localhost:8080/api/admin/entreprise';
  private readonly TENANT_INFO_URL = 'http://localhost:8080/api/tenant/info';

  constructor(private http: HttpClient) {}

  /**
   * Récupère les informations de l'entreprise actuelle (ADMIN uniquement)
   */
  getCurrentTenant(): Observable<Tenant> {
    return this.http.get<Tenant>(this.API_URL);
  }

  /**
   * Met à jour les informations de l'entreprise (ADMIN uniquement)
   */
  updateTenant(data: UpdateTenantDto): Observable<Tenant> {
    return this.http.put<Tenant>(this.API_URL, data);
  }

  /**
   * Récupère les informations de l'entreprise (accessible à tous les utilisateurs authentifiés)
   * Utilise l'endpoint /api/tenant/info qui est accessible à USER, GERANT et ADMIN
   */
  getTenantInfo(): Observable<Tenant> {
    return this.http.get<Tenant>(this.TENANT_INFO_URL);
  }
}
