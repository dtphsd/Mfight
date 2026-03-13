export interface Random {
  next(): number;
  int(min: number, max: number): number;
}

