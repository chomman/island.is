import React from 'react'
import { withDesign } from 'storybook-addon-designs'

import { withFigma } from '../../utils/withFigma'
import { Box } from '../Box/Box'
import { ContentBlock } from '../ContentBlock/ContentBlock'
import { DatePicker } from './DatePicker'

export default {
  title: 'Form/DatePicker',
  component: DatePicker,
  decorators: [withDesign],
  parameters: withFigma({
    desktop:
      'https://www.figma.com/file/pDczqgdlWxgn3YugWZfe1v/UI-Library-%E2%80%93-%F0%9F%96%A5%EF%B8%8F-Desktop?node-id=50%3A155',
  }),
}

const Wrap: React.FC = ({ children }) => (
  <Box padding={2}>
    <ContentBlock width="medium">{children}</ContentBlock>
  </Box>
)

export const Basic = () => {
  return (
    <Wrap>
      <DatePicker
        label="Date"
        placeholderText="Pick a date"
        handleChange={(date: Date) => console.log(date)}
      />
    </Wrap>
  )
}

export const Locales = () => {
  return (
    <>
      <Wrap>
        <DatePicker
          label="Dagsetning"
          placeholderText="Veldu dagsetningu"
          locale="is"
          handleChange={(date: Date) => console.log(date)}
        />
      </Wrap>
      <Wrap>
        <DatePicker
          label="Data"
          placeholderText="Wybierz datę"
          locale="pl"
          handleChange={(date: Date) => console.log(date)}
        />
      </Wrap>
    </>
  )
}

export const MinimumDate = () => {
  return (
    <Box padding={2}>
      <ContentBlock width="medium">
        <DatePicker
          label="Minimum date is today"
          placeholderText="Pick a date"
          minDate={new Date()}
          handleChange={(date: Date) => console.log(date)}
        />
      </ContentBlock>
    </Box>
  )
}
