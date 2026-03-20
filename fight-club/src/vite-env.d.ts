/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ONLINE_DUEL_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.md?raw" {
  const content: string;
  export default content;
}
