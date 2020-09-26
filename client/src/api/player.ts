import { Achievement } from './achievement';

export interface Player{
    tag: string,
    name: string,
    achievements: Achievement[]
  }