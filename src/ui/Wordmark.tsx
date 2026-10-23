export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`wordmark ${className ?? ''}`}>
      mart<span>.notes</span>
    </span>
  )
}
