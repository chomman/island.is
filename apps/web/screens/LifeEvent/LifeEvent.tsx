import React, { useMemo } from 'react'
import Head from 'next/head'
import { Screen } from '@island.is/web/types'
import { CustomNextError } from '@island.is/web/units/errors'
import slugify from '@sindresorhus/slugify'
import { Slice as SliceType } from '@island.is/island-ui/contentful'
import {
  GridRow,
  GridColumn,
  Breadcrumbs,
  Link,
  Tag,
  Text,
  Box,
  Hidden,
} from '@island.is/island-ui/core'
import { withMainLayout } from '@island.is/web/layouts/main'
import { useI18n } from '@island.is/web/i18n'
import routeNames from '@island.is/web/i18n/routeNames'
import {
  RichText,
  SidebarNavigation,
  DrawerMenu,
  BackgroundImage,
} from '@island.is/web/components'
import {
  GET_LIFE_EVENT_QUERY,
  GET_NAMESPACE_QUERY,
} from '@island.is/web/screens/queries'
import {
  GetLifeEventQuery,
  GetNamespaceQuery,
  QueryGetLifeEventPageArgs,
  QueryGetNamespaceArgs,
} from '@island.is/web/graphql/schema'
import { createNavigation } from '@island.is/web/utils/navigation'
import ArticleLayout from '@island.is/web/screens/Layouts/Layouts'
import { useNamespace } from '@island.is/web/hooks'
import useContentfulId from '@island.is/web/hooks/useContentfulId'

interface LifeEventProps {
  lifeEvent: GetLifeEventQuery['getLifeEventPage']
  namespace: GetNamespaceQuery['getNamespace']
}

export const LifeEvent: Screen<LifeEventProps> = ({
  lifeEvent: { id, slug, image, title, intro, content },
  namespace,
}) => {
  useContentfulId(id)
  const { activeLocale } = useI18n()
  const { makePath } = routeNames(activeLocale)
  const n = useNamespace(namespace)

  const navigation = useMemo(() => {
    return createNavigation(content, { title })
  }, [content, title])

  const mobileNavigation = navigation.map((x) => ({
    title: x.text,
    url: slug + '#' + x.id,
  }))

  const metaTitle = `${title} | Ísland.is`
  const metaDescription =
    intro ||
    'Ísland.is er upplýsinga- og þjónustuveita opinberra aðila á Íslandi. Þar getur fólk og fyrirtæki fengið upplýsingar og notið margvíslegrar þjónustu hjá opinberum aðilum á einum stað í gegnum eina gátt.'

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="title" property="og:title" content={metaTitle} />
        <meta
          name="description"
          property="og:description"
          content={metaDescription}
        />
      </Head>
      <ArticleLayout
        sidebar={
          <SidebarNavigation
            title={n('categoryOverview', 'Efnisyfirlit')}
            navigation={navigation}
            position="right"
          />
        }
      >
        <>
          <GridRow>
            <GridColumn span={'9/9'} paddingBottom={2}>
              <Box marginBottom={2} display="inlineBlock" width="full">
                <Hidden print={true}>
                  <BackgroundImage
                    ratio="12:4"
                    background="transparent"
                    boxProps={{ background: 'white' }}
                    image={image}
                  />
                </Hidden>
              </Box>
            </GridColumn>
          </GridRow>
          {!!mobileNavigation.length && (
            <Hidden print={true} above="sm">
              <DrawerMenu
                categories={[
                  {
                    title: n('categoryOverview', 'Efnisyfirlit'),
                    items: mobileNavigation,
                  },
                ]}
              />
            </Hidden>
          )}
          <GridRow>
            <GridColumn
              offset={['0', '0', '0', '0', '1/9']}
              span={['9/9', '9/9', '9/9', '9/9', '7/9']}
              paddingBottom={[2, 2, 4]}
            >
              <Breadcrumbs>
                <Link href={makePath()}>Ísland.is</Link>
                <Tag variant="blue" label>
                  {n('lifeEventTitle', 'Lífsviðburður')}
                </Tag>
              </Breadcrumbs>
            </GridColumn>
          </GridRow>
          <GridRow>
            <GridColumn
              offset={['0', '0', '0', '0', '1/9']}
              span={['9/9', '9/9', '9/9', '9/9', '7/9']}
            >
              <Text variant="h1" as="h1">
                <span id={slugify(title)}>{title}</span>
              </Text>
              {intro && (
                <Text variant="intro" as="p" paddingTop={2}>
                  <span id={slugify(intro)}>{intro}</span>
                </Text>
              )}
            </GridColumn>
          </GridRow>
          <Box paddingTop={[3, 3, 4]}>
            <RichText
              body={content as SliceType[]}
              config={{ defaultPadding: [2, 2, 4] }}
            />
          </Box>
        </>
      </ArticleLayout>
    </>
  )
}

LifeEvent.getInitialProps = async ({ apolloClient, locale, query }) => {
  const [
    {
      data: { getLifeEventPage: lifeEvent },
    },
    namespace,
  ] = await Promise.all([
    apolloClient.query<GetLifeEventQuery, QueryGetLifeEventPageArgs>({
      query: GET_LIFE_EVENT_QUERY,
      fetchPolicy: 'no-cache',
      variables: {
        input: { lang: locale, slug: String(query.slug) },
      },
    }),
    apolloClient
      .query<GetNamespaceQuery, QueryGetNamespaceArgs>({
        query: GET_NAMESPACE_QUERY,
        variables: {
          input: {
            namespace: 'Articles',
            lang: locale,
          },
        },
      })
      .then((content) => {
        // map data here to reduce data processing in component
        return JSON.parse(content.data.getNamespace.fields)
      }),
  ])

  if (!lifeEvent) {
    throw new CustomNextError(404, 'Life Event not found')
  }

  return { lifeEvent, namespace }
}

export default withMainLayout(LifeEvent, { hasDrawerMenu: true })
