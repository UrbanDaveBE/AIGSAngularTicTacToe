import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PingResponse } from '../models/connection.model';
import { catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private http = inject(HttpClient);

  // ZENTRALE KONFIGURATION
  readonly host = '127.0.0.1';
  readonly port = 50005;

  private _isOnline = signal<boolean>(false);
  readonly isOnline = this._isOnline.asReadonly();

  checkConnection() {
    // VARIANTE 1: Direkt (Aktuell aktiv, da CORS lokal oft kein Problem ist)
    const url = `http://${this.host}:${this.port}/ping`;

    // VARIANTE 2: Mit Proxy (Nur nutzen, wenn CORS-Fehler im Browser auftreten) -> README!!!
    // const url = '/api/ping';

    return this.http.get<PingResponse>(url).pipe(
      map(res => {
        const status = res.ping === 'success';
        this._isOnline.set(status);
        return status;
      }),
      catchError((err) => {
        console.error('Verbindungsfehler:', err);
        this._isOnline.set(false);
        return of(false);
      })
    );
  }
}
