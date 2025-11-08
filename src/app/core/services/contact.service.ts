import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interface pour la requête de contact
 */
export interface ContactRequest {
  nom: string;
  email: string;
  entreprise: string;
  sujet: string;
  message: string;
}

/**
 * Interface pour la réponse de contact
 */
export interface ContactResponse {
  message: string;
  status: string;
}

/**
 * Service pour gérer les messages de contact
 */
@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) { }

  /**
   * Envoie un message de contact
   */
  sendContactMessage(contactData: ContactRequest): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.apiUrl, contactData);
  }
}
