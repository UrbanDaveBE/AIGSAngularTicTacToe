import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html'
})
export class App {
  public gameService = inject(GameService);

  isTesting = false;
  pingClicked = false;

  onCheckPing() {
    this.isTesting = true;
    this.pingClicked = true;

    // Kleiner Timeout für visuelles Feedback im UI
    setTimeout(() => {
      this.gameService.checkConnection().subscribe({
        next: () => this.isTesting = false,
        error: () => this.isTesting = false
      });
    }, 600);
  }
}
