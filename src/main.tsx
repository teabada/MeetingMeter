import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 폰트를 번들에 넣는다. 확장 프로그램이나 오프라인에서도 외부 요청 없이 같은 글꼴로 보인다.
import '@fontsource/ibm-plex-sans-kr/400.css'
import '@fontsource/ibm-plex-sans-kr/500.css'
import '@fontsource/ibm-plex-sans-kr/700.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/700.css'
import '@fontsource/jetbrains-mono/800.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
