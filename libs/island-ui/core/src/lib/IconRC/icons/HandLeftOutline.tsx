import * as React from 'react'
import { SvgProps as SVGRProps } from '../Icon'

const SvgHandLeftOutline = ({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      className="hand-left-outline_svg__ionicon"
      viewBox="0 0 512 512"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        d="M80 320V144a32 32 0 0132-32h0a32 32 0 0132 32v112m0 0V80a32 32 0 0132-32h0a32 32 0 0132 32v160m64 1V96a32 32 0 0132-32h0a32 32 0 0132 32v224m-128-80V48a32 32 0 0132-32h0a32 32 0 0132 32v192"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={32}
      />
      <path
        d="M80 320c0 117.4 64 176 152 176s123.71-39.6 144-88l52.71-144c6.66-18.05 3.64-34.79-11.87-43.6h0c-15.52-8.82-35.91-4.28-44.31 11.68L336 320"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={32}
      />
    </svg>
  )
}

export default SvgHandLeftOutline