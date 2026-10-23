export function FormError({ message }: { message: string | null }) {
  return (
    <p className="auth-error" role="alert">
      {message}
    </p>
  )
}
