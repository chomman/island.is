import React, { forwardRef, ReactNode } from 'react'
import cn from 'classnames'
import { Text } from '../Text/Text'

import * as styles from './Tag.treat'

export type TagVariant =
  | 'blue'
  | 'darkerBlue'
  | 'purple'
  | 'white'
  | 'red'
  | 'mint'
  | 'darkerMint'
  | 'rose'
  | 'blueberry'

export interface TagProps {
  onClick?: () => void
  variant?: TagVariant
  href?: string
  id?: string
  active?: boolean
  disabled?: boolean
  label?: boolean
  bordered?: boolean
  attention?: boolean // Renders a red dot driving attention to the tag.
  children: string | ReactNode
}

const isLinkExternal = (href: string): boolean => href.indexOf('://') > 0

export const Tag = forwardRef<HTMLButtonElement & HTMLAnchorElement, TagProps>(
  (
    {
      children,
      href,
      onClick,
      variant = 'blue',
      active = false,
      disabled,
      label,
      bordered = false,
      attention,
      ...props
    }: TagProps,
    ref,
  ) => {
    const className = cn(styles.container, styles.variants[variant], {
      [styles.label]: label,
      [styles.active]: active,
      [styles.bordered]: bordered,
      [styles.attention]: attention,
    })

    const isExternal = href && isLinkExternal(href)

    const anchorProps = {
      ...(isExternal && { rel: 'noreferrer noopener' }),
    }

    const sharedProps = {
      className,
      ref,
    }

    const content = (
      <Text variant="tag" as="span">
        {children}
      </Text>
    )

    if (label) {
      return <span {...sharedProps}>{content}</span>
    }

    return href ? (
      <a href={href} {...anchorProps} {...sharedProps} {...props}>
        {content}
      </a>
    ) : (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        {...sharedProps}
        {...props}
      >
        {content}
      </button>
    )
  },
)
