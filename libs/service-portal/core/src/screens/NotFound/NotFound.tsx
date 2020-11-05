import React, { FC } from 'react'
import { Box, Text } from '@island.is/island-ui/core'
import { MessageDescriptor } from 'react-intl'
import { useLocale } from '@island.is/localization'

interface Props {
  title?: string | MessageDescriptor
}

export const NotFound: FC<Props> = ({ title }) => {
  const { formatMessage } = useLocale()

  return (
    <Box display="flex" justifyContent="center" margin={12}>
      <Text variant="h2">
        {title ? formatMessage(title) : '404, síða fannst ekki'}
      </Text>
    </Box>
  )
}
