import { ArrowDownIcon, ArrowUpIcon } from '@/ui/icons'

type Props = { title: string; onUp?: () => void; onDown?: () => void }

// Up and down the priority order, for phones and for anyone who doesn't think to drag
export function MoveButtons({ title, onUp, onDown }: Props) {
  return (
    <div className="task-move">
      <button className="icon-button" aria-label={`Move ${title} up`} disabled={!onUp} onClick={onUp}>
        <ArrowUpIcon />
      </button>
      <button className="icon-button" aria-label={`Move ${title} down`} disabled={!onDown} onClick={onDown}>
        <ArrowDownIcon />
      </button>
    </div>
  )
}
