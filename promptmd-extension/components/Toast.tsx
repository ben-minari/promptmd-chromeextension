import { Toaster } from 'react-hot-toast'

export function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#fff',
          color: '#1E293B',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          padding: '12px 16px',
          borderRadius: '0.375rem',
        },
        success: {
          iconTheme: {
            primary: '#0D9488',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
        },
      }}
    />
  )
} 