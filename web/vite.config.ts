import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ★ GitHubリポジトリ名
const REPO_NAME = '/Mikage_HishatainoHeya/'

export default defineConfig({
  plugins: [react()],
  base: REPO_NAME,
})
