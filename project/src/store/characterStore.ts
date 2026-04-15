import { create } from 'zustand';

interface CharacterState {
  characterName: string;
  avatar: string;
  fullBody: string;
  prompt: string;
  setCharacterName: (name: string) => void;
  setAvatar: (avatar: string) => void;
  setFullBody: (fullBody: string) => void;
  setPrompt: (prompt: string) => void;
  reset: () => void;
}

export const useCharacterStore = create<CharacterState>((set) => ({
  characterName: '小雪',
  avatar: '/images/avatar_01.jpg',
  fullBody: '/images/portrait_01.jpg',
  prompt: '',
  setCharacterName: (name) => set({ characterName: name }),
  setAvatar: (avatar) => set({ avatar }),
  setFullBody: (fullBody) => set({ fullBody }),
  setPrompt: (prompt) => set({ prompt }),
  reset: () => set({
    characterName: '小雪',
    avatar: '/images/avatar_01.jpg',
    fullBody: '/images/portrait_01.jpg',
    prompt: ''
  })
}));
