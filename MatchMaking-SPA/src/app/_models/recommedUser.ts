import { Photo } from './photo';

export interface RecommedUser {
  id: number;
  username: string;
  knownAs: string;
  age: number;
  gender: string;
  created: Date;
  lastActive: Date;
  photoUrl: string;
  city: string;
  country: string;
  lookingFor?: string;
  photos?: Photo[];

  bios: string;
  movies: string;
  tv: string;
  religion: string;
  music: string;
  sports: string;
  books: string;
  politics: string;
  matchingPercent: number;
}

