/// <reference types="vite/client" />

declare global {
  interface Window {
    electron: {
      minimize: () => void
      maximize: () => void
      close: () => void
    }
  }
}

export {}