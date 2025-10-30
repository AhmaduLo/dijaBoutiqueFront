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
}
