import { ThemeIcon } from '@/ui/icons'

function isDark() {
  const theme = document.documentElement.dataset.theme
  return theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeToggle() {
  function toggle() {
    const next = isDark() ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {}
  }

  return (
    <button className="sidebar-link" onClick={toggle}>
      <ThemeIcon />
      Switch theme
    </button>
  )
}
