import '@fontsource-variable/newsreader'
import '@fontsource-variable/newsreader/wght-italic.css'
import '@fontsource-variable/instrument-sans'
import '@fontsource/ibm-plex-mono/400.css'
import './styles/global.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { queryClient } from './lib/query'
import { router } from './router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
