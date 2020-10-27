import React, { FC, ReactNode, useContext } from 'react'
import cn from 'classnames'
import {
  Box,
  GridColumn,
  GridContainer,
  GridRow,
} from '@island.is/island-ui/core'
import { ColorSchemeContext, ColorSchemes } from '@island.is/web/context'

import * as styles from './GroupedPages.treat'

interface GroupedPagesProps {
  topContent: ReactNode
  bottomContent: ReactNode
  variant?: ColorSchemes
}

export const GroupedPages: FC<GroupedPagesProps> = ({
  topContent,
  bottomContent,
  variant,
}) => {
  const { colorScheme } = useContext(ColorSchemeContext)

  return (
    <GridContainer>
      <div
        className={cn(
          styles.container,
          styles.variants[variant || colorScheme],
        )}
      >
        {topContent ? (
          <Box paddingY={[3, 3, 6, 10]} paddingX={[3, 3, 0]}>
            <GridRow>
              <GridColumn span="10/12" offset={[null, null, '1/12']}>
                {topContent}
              </GridColumn>
            </GridRow>
          </Box>
        ) : null}
        {bottomContent ? (
          <Box className={styles.bottom} paddingBottom={[3, 3, 6, 10]}>
            <GridRow>
              <GridColumn span="10/12" offset={[null, null, '1/12']}>
                {bottomContent}
              </GridColumn>
            </GridRow>
          </Box>
        ) : null}
      </div>
    </GridContainer>
  )
}

export default GroupedPages
