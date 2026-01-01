import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameService {
  private http = inject(HttpClient);

  readonly host = signal('127.0.0.1');
  readonly port = signal(50005);

  readonly useProxy = signal<boolean>(false);

  private _isOnline = signal<boolean>(false);
  readonly isOnline = this._isOnline.asReadonly();

  checkConnection() {
    const url = this.useProxy()
      ? '/api/ping'
      : `http://${this.host()}:${this.port()}/ping`;

    return this.http.get<any>(url).pipe(
      map(res => {
        const status = res.ping === 'success' || !!res.userName;
        this._isOnline.set(true);
        return true;
      }),
      catchError(() => {
        this._isOnline.set(false);
        return of(false);
      })
    );
  }

  toggleProxy() {
    this.useProxy.update(val => !val);
    this._isOnline.set(false);
  }
}
