import React, { FC, Children } from 'react'
import { Text } from '../Text/Text'
import { Icon } from '../Icon/Icon'
import { Colors } from '@island.is/island-ui/theme'
import * as styles from './Breadcrumbs.treat'

interface BreadcrumbsProps {
  label?: string
  color?: Colors
  separatorColor?: Colors
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({
  label = 'breadcrumb',
  color = 'blue400',
  separatorColor = 'blue400',
  children,
}) => {
  const crumbs = Children.toArray(children).filter((c) => c)

  return (
    <div aria-label={label}>
      {crumbs.map((child, index) => (
        <span key={index}>
          <Text variant="eyebrow" as="span" color={color}>
            {child}
          </Text>
          {crumbs.length - 1 > index && (
            <span className={styles.divider}>
              <Icon type="bullet" width="4" color={separatorColor} />
            </span>
          )}
        </span>
      ))}
    </div>
  )
}
