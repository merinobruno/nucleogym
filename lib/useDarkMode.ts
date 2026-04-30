import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(localStorage.getItem('nucleogym_dark') === 'true')
  }, [])

  function toggle() {
    setDark(prev => {
      const next = !prev
      localStorage.setItem('nucleogym_dark', String(next))
      return next
    })
  }

  return { dark, toggle }
}
