import type { SVGProps } from 'react'

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  )
}

export const ChevronIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M6 4l4 4-4 4" />
  </Icon>
)

export const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M8 3v10M3 8h10" />
  </Icon>
)

export const MoreIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props} fill="currentColor" stroke="none">
    <circle cx="3.5" cy="8" r="1.25" />
    <circle cx="8" cy="8" r="1.25" />
    <circle cx="12.5" cy="8" r="1.25" />
  </Icon>
)

export const TrashIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" />
  </Icon>
)

export const MenuIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M2.5 5h11M2.5 11h11" />
  </Icon>
)

export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </Icon>
)

export const ArrowLeftIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M13 8H3M7 4L3 8l4 4" />
  </Icon>
)

export const ThemeIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <circle cx="8" cy="8" r="5.5" />
    <path d="M8 2.5v11a5.5 5.5 0 0 0 0-11z" fill="currentColor" />
  </Icon>
)
