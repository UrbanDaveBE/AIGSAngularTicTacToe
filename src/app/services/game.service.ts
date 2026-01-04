import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, Observable, throwError, tap } from 'rxjs';
import { GameResponse, MoveRequest, NewGameRequest } from '../models/game.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  private http = inject(HttpClient);

  readonly host = signal('127.0.0.1');
  readonly port = signal(50005);

  readonly useProxy = signal<boolean>(false);

  private _isOnline = signal<boolean>(false);
  readonly isOnline = this._isOnline.asReadonly();

  private _gameState = signal<GameResponse | null>(null);
  readonly gameState = this._gameState.asReadonly();

  private getBaseUrl(): string {
    return this.useProxy()
      ? '/api'
      : `http://${this.host()}:${this.port()}`;
  }

  checkConnection(): Observable<boolean> {
    const url = `${this.getBaseUrl()}/ping`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const status = res && (res.ping === 'success' || !!res.userName || res.status === 'ok');
        this._isOnline.set(status);
        return status;
      }),
      catchError(() => {
        this._isOnline.set(false);
        return of(false);
      })
    );
  }

  startNewGame(req: NewGameRequest): Observable<GameResponse> {
    return this.http.post<GameResponse>(`${this.getBaseUrl()}/game/new`, req).pipe(
      tap(res => this._gameState.set(res)),
      catchError(err => this.handleError(err))
    );
  }

  makeMove(req: MoveRequest): Observable<GameResponse> {
    return this.http.post<GameResponse>(`${this.getBaseUrl()}/game/move`, req).pipe(
      map(res => {
        if (res && res.error) throw res.error_description || res.error;
        return res;
      }),
      tap(res => this._gameState.set(res)),
      catchError(err => this.handleError(err))
    );
  }

  toggleProxy() {
    this.useProxy.update(val => !val);
    this._isOnline.set(false);
    this._gameState.set(null);
  }

  private handleError(error: any) {
    console.error('GameService Error:', error);
    let msg = 'Ein technischer Fehler ist aufgetreten.';
    if (typeof error === 'string') msg = error;
    return throwError(() => msg);
  }
}
