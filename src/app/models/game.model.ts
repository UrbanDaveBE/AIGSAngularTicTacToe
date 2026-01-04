export interface NewGameRequest {
  token: string;
  gameType: string;
  difficulty: number;
}

export interface MoveRequest {
  token: string;
  row: string;
  col: string;
}

export interface GameResponse {
  board: number[][];
  difficulty: number;
  gameType: string;
  token: string;
  result: boolean;
  error?: string;
  error_description?: string;
}
