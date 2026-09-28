import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// The course docs are framed on /learn and link back here: open those links
// at the top level, never this site nested inside its own frame.
try {
  if (window.top && window.top !== window.self && window.top.location.origin === window.location.origin) {
    window.top.location.replace(window.location.href);
  }
} catch {
  /* a cross-origin parent throws here: leave it alone */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
