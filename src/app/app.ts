import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>AIGS PING TEST</h1>
      <button (click)="doPing()" style="padding: 10px; cursor: pointer;">
        PING PING PING!
      </button>
      <p>Status: <strong>{{ message }}</strong></p>
    </div>
  `
})
export class App {
  private http = inject(HttpClient);
  message = 'Noch nicht gepingt';

  doPing() {

    this.http.get<any>('/api/ping').subscribe({
      next: (res) => {
        this.message = res.ping;
      },
      error: (err) => {
        this.message = 'Fehler: Server nicht erreichbar!';
        console.error(err);
      }
    });
  }
}
