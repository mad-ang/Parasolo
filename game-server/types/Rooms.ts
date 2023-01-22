export enum RoomType {
  LOBBY = 'lobby',
  PUBLIC = 'parasolo',
}

export interface IParaData {
  name: string;
  description: string;
  password: string | null;
  autoDispose: boolean;
}
