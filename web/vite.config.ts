import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ★ GitHubリポジトリ名
const REPO_NAME = '/dia_sing_for_answers/'

export default defineConfig({
  plugins: [react()],
  base: REPO_NAME,
})
