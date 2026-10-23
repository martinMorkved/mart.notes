import { dismissToast, useToast } from './toast'
import { CloseIcon } from './icons'

export function Toaster() {
  const toast = useToast()

  return (
    <div className="toaster" role="status" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.id}>
          <p>{toast.message}</p>
          {toast.action && (
            <button
              className="toast-action"
              onClick={() => {
                toast.action!.run()
                dismissToast()
              }}
            >
              {toast.action.label}
            </button>
          )}
          <button className="icon-button" aria-label="Dismiss" onClick={dismissToast}>
            <CloseIcon />
          </button>
        </div>
      )}
    </div>
  )
}
