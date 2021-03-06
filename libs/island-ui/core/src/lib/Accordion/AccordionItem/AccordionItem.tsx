import React, {
  useContext,
  useState,
  ReactNode,
  forwardRef,
  FC,
  useEffect,
  useCallback,
} from 'react'
import cn from 'classnames'
import AnimateHeight from 'react-animate-height'

import { Box } from '../../Box/Box'
import { Column } from '../../Column/Column'
import { Columns } from '../../Columns/Columns'
import { AllOrNone } from '../../private/AllOrNone'
import { useVirtualTouchable } from '../../private/touchable/useVirtualTouchable'
import { hideFocusRingsClassName } from '../../private/hideFocusRings/hideFocusRings'
import { Overlay } from '../../private/Overlay/Overlay'
import { Text } from '../../Text/Text'
import { TextVariants } from '../../Text/Text.treat'
import { AccordionContext } from '../../Accordion/Accordion'
import * as styles from './AccordionItem.treat'

type IconVariantTypes = 'default' | 'sidebar'

export type AccordionItemLabelTags = 'p' | 'h2' | 'h3' | 'h4' | 'h5'

export type AccordionItemBaseProps = {
  id: string
  label: string
  labelVariant?: TextVariants
  labelUse?: AccordionItemLabelTags
  iconVariant?: IconVariantTypes
  visibleContent?: ReactNode
  children: ReactNode
  startExpanded?: boolean
  onClick?: () => void
  onBlur?: () => void
  onFocus?: () => void
}

export type AccordionItemStateProps = AllOrNone<{
  expanded?: boolean
  onToggle: (expanded: boolean) => void
}>

export type AccordionItemProps = AccordionItemBaseProps &
  AccordionItemStateProps

export const AccordionItem = forwardRef<HTMLButtonElement, AccordionItemProps>(
  (
    {
      id,
      label,
      labelVariant = 'h4',
      labelUse = 'h3',
      iconVariant = 'default',
      visibleContent,
      expanded: expandedProp,
      onToggle,
      children,
      startExpanded,
      onClick,
      onBlur,
      onFocus,
    },
    forwardedRef,
  ) => {
    if (process.env.NODE_ENV !== 'production') {
      if (label !== undefined && typeof label !== 'string') {
        throw new Error('Label must be a string')
      }
    }

    const { toggledId, setToggledId } = useContext(AccordionContext)
    const [expandedFallback, setExpandedFallback] = useState(false)
    let expanded = expandedProp ?? expandedFallback
    const [height, setHeight] = useState(expanded ? 'auto' : 0)

    if (toggledId && toggledId !== id && expanded) {
      expanded = false

      if (height !== 0) {
        setHeight(0)
      }
    }

    const handleOpen = () => {
      const newValue = !expanded
      if (typeof setToggledId === 'function' && newValue) {
        setToggledId(id)
      }

      setHeight(newValue ? 'auto' : 0)

      if (expandedProp === undefined) {
        setExpandedFallback(newValue)
      }

      if (typeof onToggle === 'function') {
        onToggle(newValue)
      }
    }

    const handleClose = () => {
      expanded = false
      setHeight(0)

      if (expandedProp === undefined) {
        setExpandedFallback(false)
      }

      if (typeof onToggle === 'function') {
        onToggle(false)
      }
    }

    const onHandleOpen = useCallback(handleOpen, [])

    useEffect(() => {
      if (startExpanded) {
        onHandleOpen()
      } else {
        handleClose()
      }
    }, [onHandleOpen, startExpanded])

    return (
      <Box>
        <Box position="relative" display="flex">
          <Box
            ref={forwardedRef}
            component="button"
            type="button"
            cursor="pointer"
            className={[styles.button, useVirtualTouchable()]}
            outline="none"
            width="full"
            textAlign="left"
            aria-controls={id}
            aria-expanded={expanded}
            onFocus={onFocus}
            onBlur={onBlur}
            onClick={onClick ? onClick : handleOpen}
          >
            <Columns space={2} alignY="center">
              <Column>
                <Box
                  height="full"
                  width="full"
                  display="flex"
                  alignItems="center"
                >
                  <Text variant={labelVariant} as={labelUse}>
                    {label}
                  </Text>
                </Box>
                {visibleContent && (
                  <Box paddingTop={2}>
                    <Text>{visibleContent}</Text>
                  </Box>
                )}
              </Column>
              <Column width="content">
                <div
                  className={cn(
                    styles.plusIconWrap,
                    styles.iconWrapVariants[iconVariant],
                  )}
                >
                  <svg
                    className={cn(
                      styles.plusIcon,
                      styles.iconVariants[iconVariant],
                      {
                        [styles.plusIconActive]: expanded,
                      },
                    )}
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.4286 11.4286H18.5714C19.3571 11.4286 20 10.7857 20 9.99998C20 9.21427 19.3571 8.57141 18.5714 8.57141H11.4286H8.57143H1.42857C0.642857 8.57141 0 9.21427 0 9.99998C0 10.7857 0.642857 11.4286 1.42857 11.4286H8.57143H11.4286Z"
                      className={cn(styles.plusIconX, {
                        [styles.plusIconXActive]: expanded,
                      })}
                    />
                    <path
                      d="M8.57157 11.4286L8.57157 18.5714C8.57157 19.3571 9.21442 20 10.0001 20C10.7859 20 11.4287 19.3571 11.4287 18.5714L11.4287 11.4286L11.4287 8.57143L11.4287 1.42857C11.4287 0.642857 10.7859 -2.81002e-08 10.0001 -6.24449e-08C9.21442 -9.67895e-08 8.57157 0.642857 8.57157 1.42857L8.57157 8.57143L8.57157 11.4286Z"
                      className={styles.plusIconY}
                    />
                  </svg>
                </div>
              </Column>
            </Columns>
          </Box>
          <Overlay className={[styles.focusRing, hideFocusRingsClassName]} />
        </Box>
        <AnimateHeight duration={300} height={height}>
          <Box id={id} paddingTop={2}>
            {children}
          </Box>
        </AnimateHeight>
      </Box>
    )
  },
)

type AlternateAccordionItemBaseProps = Omit<
  AccordionItemBaseProps,
  'iconVariant'
>

export const AccordionCard: FC<AlternateAccordionItemBaseProps> = (props) => {
  const [isFocused, setIsFocused] = useState<boolean>(false)

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  return (
    <Box
      height="full"
      background="white"
      borderRadius="large"
      className={cn(styles.card, { [styles.focused]: isFocused })}
      padding={[2, 2, 4]}
    >
      <AccordionItem {...props} onFocus={handleFocus} onBlur={handleBlur}>
        {props.children}
      </AccordionItem>
    </Box>
  )
}

export const SidebarAccordion: FC<Omit<
  AlternateAccordionItemBaseProps,
  'labelVariant'
>> = (props) => {
  return (
    <AccordionItem {...props} labelVariant="default" iconVariant="sidebar">
      {props.children}
    </AccordionItem>
  )
}
