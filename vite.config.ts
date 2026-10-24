import { cpSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/** `extension/`의 매니페스트·아이콘·백그라운드 스크립트를 빌드 결과에 넣는다. 버전은 package.json을 따른다. */
function chromeExtension(): Plugin {
  let outDir = ''
  return {
    name: 'chrome-extension',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      cpSync('extension', outDir, { recursive: true })
      const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }
      const manifestPath = resolve(outDir, 'manifest.json')
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>
      writeFileSync(manifestPath, JSON.stringify({ ...manifest, version }, null, 2))
    },
  }
}

// https://vite.dev/config/
// `vite build`는 웹 배포용(dist), `vite build --mode extension`은 크롬 확장용(dist-extension).
export default defineConfig(({ mode }) => {
  const extension = mode === 'extension'
  return {
    // 상대 경로로 내보내야 하위 경로(GitHub Pages)와 chrome-extension:// 어디서든 열린다.
    base: './',
    plugins: [react(), extension && chromeExtension()],
    build: extension ? { outDir: 'dist-extension' } : undefined,
  }
})
