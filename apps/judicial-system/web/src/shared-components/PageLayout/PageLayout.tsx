import React, { ReactNode, FC, useContext } from 'react'
import {
  Box,
  GridContainer,
  GridRow,
  GridColumn,
  FormStepper,
  AlertBanner,
  LinkContext,
} from '@island.is/island-ui/core'
import { userContext } from '../../utils/userContext'
import * as styles from './PageLayout.treat'
import { JudgeLogo, ProsecutorLogo } from '../Logos'
import Loading from '../Loading/Loading'
import * as Constants from '../../utils/constants'
import { UserRole } from '@island.is/judicial-system/types'
import { Link } from 'react-router-dom'

interface PageProps {
  children: ReactNode
  activeSection: number
  activeSubSection: number
  isLoading: boolean
}

export const PageLayout: FC<PageProps> = ({
  children,
  activeSection,
  activeSubSection,
  isLoading,
}) => {
  const { user } = useContext(userContext)

  return children ? (
    <Box
      paddingY={[3, 3, 3, 6]}
      background="purple100"
      className={styles.processContainer}
    >
      <GridContainer>
        <GridRow>
          <GridColumn span={['12/12', '12/12', '9/12', '9/12']}>
            <Box
              paddingY={[0, 0, 10, 10]}
              background="white"
              borderColor="white"
              borderRadius="large"
              className={styles.processContent}
            >
              <GridColumn
                span={['9/9', '9/9', '7/9', '7/9']}
                offset={['0', '0', '1/9', '1/9']}
              >
                {children}
              </GridColumn>
            </Box>
          </GridColumn>
          <GridColumn span={['0', '0', '3/12', '3/12']}>
            <Box marginLeft={2}>
              {user?.role === UserRole.JUDGE ? (
                <Box marginBottom={7}>
                  <JudgeLogo />
                </Box>
              ) : user?.role === UserRole.PROSECUTOR ? (
                <Box marginBottom={7}>
                  <ProsecutorLogo />
                </Box>
              ) : null}
              <FormStepper
                sections={[
                  {
                    name: 'Krafa um gæsluvarðhald',
                    children: [
                      { type: 'SUB_SECTION', name: 'Grunnupplýsingar' },
                      { type: 'SUB_SECTION', name: 'Málsatvik og lagarök' },
                      { type: 'SUB_SECTION', name: 'Yfirlit kröfu' },
                    ],
                  },
                  {
                    name: 'Úrskurður Héraðsdóms',
                    children: [
                      { type: 'SUB_SECTION', name: 'Yfirlit kröfu' },
                      { type: 'SUB_SECTION', name: 'Fyrirtökutími' },
                      { type: 'SUB_SECTION', name: 'Þingbók' },
                      { type: 'SUB_SECTION', name: 'Úrskurður' },
                      { type: 'SUB_SECTION', name: 'Úrskurðarorð' },
                      { type: 'SUB_SECTION', name: 'Yfirlit úrskurðar' },
                    ],
                  },
                ]}
                formName="Gæsluvarðhald"
                activeSection={activeSection}
                activeSubSection={activeSubSection}
              />
            </Box>
          </GridColumn>
        </GridRow>
      </GridContainer>
    </Box>
  ) : isLoading ? (
    <Box className={styles.loadingWrapper}>
      <Loading />
    </Box>
  ) : (
    <LinkContext.Provider
      value={{
        linkRenderer: (href, children) => (
          <Link to={href} color="blue400" className={styles.link}>
            {children}
          </Link>
        ),
      }}
    >
      <AlertBanner
        title="Mál fannst ekki"
        description="Vinsamlegast reynið aftur með því að opna málið aftur frá yfirlitssíðunni"
        variant="error"
        link={{
          href: Constants.DETENTION_REQUESTS_ROUTE,
          title: 'Fara á yfirlitssíðu',
        }}
      />
    </LinkContext.Provider>
  )
}
