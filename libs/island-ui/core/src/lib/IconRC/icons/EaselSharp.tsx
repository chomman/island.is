import * as React from 'react'
import { SvgProps as SVGRProps } from '../Icon'

const SvgEaselSharp = ({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      className="easel-sharp_svg__ionicon"
      viewBox="0 0 512 512"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path d="M468 64H278V32h-44v32H44a12 12 0 00-12 12v280a12 12 0 0012 12h78.19L89.93 470.46l36.53 9.61L161.74 368H234v64h44v-64h71.84l31 111.7 36.83-8.57L389.05 368H468a12 12 0 0012-12V76a12 12 0 00-12-12zm-26 266H70V102h372z" />
      <path d="M88 120h336v192H88z" />
    </svg>
  )
}

export default SvgEaselSharp