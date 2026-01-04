import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthRequest, AuthResponse } from '../models/user.model';
import { catchError, tap, map, throwError, Observable } from 'rxjs';
import { GameService } from './game.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private gameService = inject(GameService);

  private _currentUser = signal<string | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  private _token = signal<string | null>(null);
  readonly token = this._token.asReadonly();

  private _isLoggedIn = signal<boolean>(false);
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  private getBaseUrl(): string {
    return this.gameService.useProxy()
      ? '/api'
      : `http://${this.gameService.host()}:${this.gameService.port()}`;
  }

  register(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.getBaseUrl()}/users/register`, credentials).pipe(
      map(res => {
        if (res && res.error) throw res.error_description || res.error;
        return res;
      }),
      catchError(this.handleError)
    );
  }

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.getBaseUrl()}/users/login`, credentials).pipe(
      map(res => {
        if (res && res.error) throw res.error_description || res.error;
        return res;
      }),
      tap((res) => {
        this._currentUser.set(res.userName || credentials.userName);
        this._token.set(res.token || null);
        this._isLoggedIn.set(true);
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    const user = this._currentUser();
    const url = `${this.getBaseUrl()}/users/logout`;

    return this.http.post(url, { userName: user }).pipe(
      tap(() => this.clearLocalState()),
      catchError((err) => {
        this.clearLocalState();
        return this.handleError(err);
      })
    );
  }

  private clearLocalState() {
    this._currentUser.set(null);
    this._token.set(null);
    this._isLoggedIn.set(false);
  }

  private handleError(error: any) {
    let msg = 'Server-Verbindung fehlgeschlagen.';
    if (typeof error === 'string') {
      msg = error;
    } else if (error instanceof HttpErrorResponse) {
      msg = error.error?.error_description || error.error?.error || `Fehler: ${error.status}`;
    }
    return throwError(() => msg);
  }
}
