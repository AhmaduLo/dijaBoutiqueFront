import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Service de gestion des fichiers (photos des articles)
 */
@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Upload une photo d'article
   * @param file Fichier image à uploader
   * @param type Type de fichier ('achat' ou 'vente')
   * @returns Observable avec l'URL de la photo uploadée
   */
  uploadPhoto(file: File, type: 'achat' | 'vente'): Observable<{ url?: string; photoUrl?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    // Le backend attend 'achats' ou 'ventes' au pluriel
    formData.append('type', type === 'achat' ? 'achats' : 'ventes');

    return this.http.post<{ url?: string; photoUrl?: string }>(`${this.apiUrl}/files/upload`, formData);
  }

  /**
   * Supprime une photo
   * @param photoUrl URL complète de la photo à supprimer
   * @returns Observable vide
   */
  deletePhoto(photoUrl: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/files/photos`, {
      params: { url: photoUrl }
    });
  }

  /**
   * Construit l'URL complète de la photo pour l'affichage
   * @param photoUrl URL relative de la photo (retournée par le backend)
   * @returns URL complète de la photo
   */
  getPhotoUrl(photoUrl: string | null): string {
    if (!photoUrl) {
      return this.getDefaultPhotoUrl();
    }
    // Si l'URL commence déjà par http, la retourner telle quelle
    if (photoUrl.startsWith('http')) {
      return photoUrl;
    }
    // Si photoUrl commence par /api, enlever /api de apiUrl pour éviter le doublon
    if (photoUrl.startsWith('/api')) {
      // apiUrl = http://localhost:8080/api, on prend juste http://localhost:8080
      const baseUrl = this.apiUrl.replace(/\/api$/, '');
      return `${baseUrl}${photoUrl}`;
    }
    // Sinon, construire l'URL complète normalement
    return `${this.apiUrl}${photoUrl}`;
  }

  /**
   * Retourne l'URL d'une photo par défaut (placeholder)
   */
  getDefaultPhotoUrl(): string {
    // Utiliser une data URL inline pour éviter les problèmes de chargement
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+CiAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmM2Y0ZjYiLz4KICA8ZyBvcGFjaXR5PSIwLjMiPgogICAgPHBhdGggZD0iTTcwIDgwaDYwdjQwSDcweiIgZmlsbD0iIzljYTNhZiIvPgogICAgPGNpcmNsZSBjeD0iODUiIGN5PSI5NSIgcj0iOCIgZmlsbD0iIzljYTNhZiIvPgogICAgPHBhdGggZD0iTTcwIDEyMGwyMC0yMCAxNSAxNSAyNS0yNXYzMEg3MHoiIGZpbGw9IiM2YjcyODAiLz4KICA8L2c+CiAgPHRleHQgeD0iMTAwIiB5PSIxNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCI+CiAgICBBdWN1bmUgaW1hZ2UKICA8L3RleHQ+Cjwvc3ZnPg==';
  }

  /**
   * Valide un fichier image avant upload
   * @param file Fichier à valider
   * @returns Message d'erreur ou null si valide
   */
  validateImageFile(file: File): string | null {
    // Vérifier le type MIME
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Format non supporté. Utilisez JPG, PNG ou WEBP.';
    }

    // Vérifier la taille (5 MB max)
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      return 'La taille du fichier ne doit pas dépasser 5 MB.';
    }

    return null;
  }

  /**
   * Crée une miniature pour prévisualisation
   * @param file Fichier image
   * @returns Promise avec l'URL de la miniature
   */
  createPreviewUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        resolve(e.target.result);
      };
      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };
      reader.readAsDataURL(file);
    });
  }
}
