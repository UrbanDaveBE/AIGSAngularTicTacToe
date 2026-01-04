import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { GameService } from './services/game.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html'
})
export class App implements OnInit {
  public gameService = inject(GameService);
  public authService = inject(AuthService);

  authForm = new FormGroup({
    userName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4)]
    })
  });

  difficultyControl = new FormControl(1, { nonNullable: true });

  // UI-Zustände als Signals
  isTesting = signal(false);
  pingClicked = signal(false);
  authMessage = signal('');
  isError = signal(false);
  isGameLoading = signal(false);

  board = computed(() => this.gameService.gameState()?.board || [
    [0, 0, 0], [0, 0, 0], [0, 0, 0]
  ]);

  ngOnInit(): void {
  }

  onCheckPing() {
    this.isTesting.set(true);
    this.pingClicked.set(true);
    this.authMessage.set('');

    setTimeout(() => {
      this.gameService.checkConnection().subscribe({
        next: () => this.isTesting.set(false),
        error: () => this.isTesting.set(false)
      });
    }, 600);
  }

  onLogin() {
    if (this.authForm.invalid) return;
    this.authMessage.set('');

    this.authService.login(this.authForm.getRawValue()).subscribe({
      next: () => this.setFeedback('Login erfolgreich!', false),
      error: (err) => this.setFeedback(err, true)
    });
  }

  onRegister() {
    if (this.authForm.invalid) return;
    this.authMessage.set('');

    this.authService.register(this.authForm.getRawValue()).subscribe({
      next: () => this.setFeedback('Registrierung erfolgreich! Bitte jetzt einloggen.', false),
      error: (err) => this.setFeedback(err, true)
    });
  }

  onLogout() {
    this.authMessage.set('');
    this.authService.logout().subscribe({
      next: () => {
        this.setFeedback('Abmeldung erfolgreich.', false);
        this.authForm.reset();
        this.gameService.resetGame();
      },
      error: (err) => {
        this.setFeedback(err, true);
        this.authForm.reset();
        this.gameService.resetGame();
      }
    });
  }

  onStartNewGame() {
    const token = this.authService.token();
    if (!token) {
      this.setFeedback('Kein gültiges Token gefunden. Bitte neu einloggen.', true);
      return;
    }

    this.isGameLoading.set(true);
    this.gameService.startNewGame({
      token: token,
      gameType: 'TicTacToe',
      difficulty: this.difficultyControl.value
    }).subscribe({
      next: () => {
        this.isGameLoading.set(false);
        this.authMessage.set('');
      },
      error: (err) => {
        this.isGameLoading.set(false);
        this.setFeedback(err, true);
      }
    });
  }

  onResetGame() {
    this.gameService.resetGame();
    this.authMessage.set('');
  }

  onCellClick(row: number, col: number) {
    const state = this.gameService.gameState();
    const token = this.authService.token();

    if (!state || state.result || this.board()[row][col] !== 0 || !token) {
      return;
    }

    this.gameService.makeMove({
      token: token,
      row: row.toString(),
      col: col.toString()
    }).subscribe({
      error: (err) => this.setFeedback(err, true)
    });
  }

  private setFeedback(msg: string, error: boolean) {
    this.authMessage.set(msg);
    this.isError.set(error);
  }
}
