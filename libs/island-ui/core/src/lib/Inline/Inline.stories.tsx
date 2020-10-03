import React from 'react'
import { Box } from '../Box'
import { ContentBlock } from '../ContentBlock'
import { Logo } from '../Logo/Logo'
import Typography from '../Typography/Typography'
import { Inline } from './Inline'

export default {
  title: 'Core/Inline',
  component: Inline,
}

export const Default = () => (
  <Box paddingY={2}>
    <ContentBlock width="medium">
      <Inline space="containerGutter">
        <Typography>
          Renders content horizontally with consistent spacing between all
          items, spanning multiple lines if needed. See `Stack` for a vertical
          version.
        </Typography>
        <Logo />
        <Logo />
        <Logo />
        <Logo />
        <Logo />
        <Logo />
      </Inline>
    </ContentBlock>
  </Box>
)