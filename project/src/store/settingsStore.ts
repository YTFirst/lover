import { create } from 'zustand';

interface SettingsState {
  model: string;
  apiUrl: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
  messagePercentage: number;
  setModel: (model: string) => void;
  setApiUrl: (apiUrl: string) => void;
  setApiKey: (apiKey: string) => void;
  setMaxTokens: (maxTokens: number) => void;
  setTemperature: (temperature: number) => void;
  setMessagePercentage: (messagePercentage: number) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  model: 'GPT-4o-mini',
  apiUrl: 'https://api.openai.com/v1',
  apiKey: '',
  maxTokens: 1024,
  temperature: 0.8,
  messagePercentage: 50,
  setModel: (model) => set({ model }),
  setApiUrl: (apiUrl) => set({ apiUrl }),
  setApiKey: (apiKey) => set({ apiKey }),
  setMaxTokens: (maxTokens) => set({ maxTokens }),
  setTemperature: (temperature) => set({ temperature }),
  setMessagePercentage: (messagePercentage) => set({ messagePercentage }),
  reset: () => set({
    model: 'GPT-4o-mini',
    apiUrl: 'https://api.openai.com/v1',
    apiKey: '',
    maxTokens: 1024,
    temperature: 0.8,
    messagePercentage: 50
  })
}));
