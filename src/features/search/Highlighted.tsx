// Text from the search endpoint, with each ⟦hit⟧ shown as a <mark>
export function Highlighted({ text }: { text: string }) {
  return text
    .split(/⟦([^⟧]*)⟧/)
    .map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part))
}
