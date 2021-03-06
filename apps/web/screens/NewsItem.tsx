/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import {
  Text,
  Breadcrumbs,
  Box,
  Link,
  GridRow,
  GridColumn,
  Stack,
  GridContainer,
  Tag,
} from '@island.is/island-ui/core'
import { Image, Slice as SliceType } from '@island.is/island-ui/contentful'
import { Screen } from '@island.is/web/types'
import { useI18n } from '@island.is/web/i18n'
import { useDateUtils } from '@island.is/web/i18n/useDateUtils'
import routeNames from '@island.is/web/i18n/routeNames'
import {
  GET_NAMESPACE_QUERY,
  GET_SINGLE_NEWS_ITEM_QUERY,
} from '@island.is/web/screens/queries'
import { CustomNextError } from '@island.is/web/units/errors'
import { withMainLayout } from '@island.is/web/layouts/main'
import useContentfulId from '@island.is/web/hooks/useContentfulId'
import {
  ContentLanguage,
  GetSingleNewsItemQuery,
  QueryGetSingleNewsArgs,
  QueryGetNamespaceArgs,
  GetNamespaceQuery,
} from '@island.is/web/graphql/schema'
import { RichText } from '../components/RichText/RichText'
import { SidebarBox, Sticky, HeadWithSocialSharing } from '../components'
import { useNamespace } from '@island.is/web/hooks'

interface NewsItemProps {
  newsItem: GetSingleNewsItemQuery['getSingleNews']
  namespace: GetNamespaceQuery['getNamespace']
}

const NewsItem: Screen<NewsItemProps> = ({ newsItem, namespace }) => {
  useContentfulId(newsItem?.id)
  const { activeLocale, t } = useI18n()
  const { makePath } = routeNames(activeLocale)
  const { format } = useDateUtils()
  const n = useNamespace(namespace)

  const metaTitle = `${newsItem.title} | Ísland.is`

  const sidebar = (
    <SidebarBox>
      <Stack space={3}>
        {Boolean(newsItem.author) && (
          <Stack space={1}>
            <Text variant="eyebrow" as="p" color="blue400">
              {n('author', 'Höfundur')}
            </Text>
            <Text variant="h5" as="p">
              {newsItem.author.name}
            </Text>
          </Stack>
        )}
        {Boolean(newsItem.date) && (
          <Stack space={1}>
            <Text variant="eyebrow" as="p" color="blue400">
              {n('published', 'Birt')}
            </Text>
            <Text variant="h5" as="p">
              {format(new Date(newsItem.date), 'do MMMM yyyy')}
            </Text>
          </Stack>
        )}
      </Stack>
    </SidebarBox>
  )

  return (
    <>
      <HeadWithSocialSharing
        title={metaTitle}
        description={newsItem.intro}
        imageUrl={newsItem.image?.url}
        imageWidth={newsItem.image?.width.toString()}
        imageHeight={newsItem.image?.height.toString()}
      />
      <GridContainer>
        <Box paddingTop={[2, 2, 10]} paddingBottom={[0, 0, 10]}>
          <GridRow>
            <GridColumn span={['12/12', '12/12', '8/12', '8/12', '9/12']}>
              <GridRow>
                <GridColumn
                  offset={['0', '0', '0', '0', '1/9']}
                  span={['9/9', '9/9', '9/9', '9/9', '7/9']}
                >
                  <Breadcrumbs>
                    <Link href={makePath()} as={makePath()}>
                      Ísland.is
                    </Link>
                    <Link href={makePath('news')} as={makePath('news')}>
                      {t.newsAndAnnouncements}
                    </Link>
                    {!!newsItem.genericTags.length &&
                      newsItem.genericTags.map(({ id, title }, index) => {
                        return (
                          <Link
                            key={index}
                            href={{
                              pathname: makePath('news'),
                              query: { tag: id },
                            }}
                            as={makePath('news', `?tag=${id}`)}
                            pureChildren
                          >
                            <Tag variant="blue">{title}</Tag>
                          </Link>
                        )
                      })}
                  </Breadcrumbs>
                  <Text variant="h1" as="h1" paddingTop={1} paddingBottom={2}>
                    {newsItem.title}
                  </Text>
                  <Text variant="intro" as="p" paddingBottom={2}>
                    {newsItem.intro}
                  </Text>
                  {Boolean(newsItem.image) && (
                    <Box paddingY={2}>
                      <Image
                        {...newsItem.image}
                        url={newsItem.image.url + '?w=774&fm=webp&q=80'}
                        thumbnail={newsItem.image.url + '?w=50&fm=webp&q=80'}
                      />
                    </Box>
                  )}
                </GridColumn>
              </GridRow>
              <Box paddingBottom={4} width="full">
                <RichText
                  body={newsItem.content as SliceType[]}
                  config={{ defaultPadding: [2, 2, 4] }}
                />
              </Box>
            </GridColumn>
            <GridColumn span={['12/12', '12/12', '4/12', '4/12', '3/12']}>
              <Sticky>
                <SidebarBox>
                  <Stack space={3}>
                    {Boolean(newsItem.author) && (
                      <Stack space={1}>
                        <Text variant="eyebrow" as="p" color="blue400">
                          {n('author', 'Höfundur')}
                        </Text>
                        <Text variant="h5" as="p">
                          {newsItem.author.name}
                        </Text>
                      </Stack>
                    )}
                    {Boolean(newsItem.date) && (
                      <Stack space={1}>
                        <Text variant="eyebrow" as="p" color="blue400">
                          {n('published', 'Birt')}
                        </Text>
                        <Text variant="h5" as="p">
                          {format(new Date(newsItem.date), 'do MMMM yyyy')}
                        </Text>
                      </Stack>
                    )}
                  </Stack>
                </SidebarBox>
              </Sticky>
            </GridColumn>
          </GridRow>
        </Box>
      </GridContainer>
    </>
  )
}

NewsItem.getInitialProps = async ({ apolloClient, locale, query }) => {
  const [
    {
      data: { getSingleNews: newsItem },
    },

    namespace,
  ] = await Promise.all([
    apolloClient.query<GetSingleNewsItemQuery, QueryGetSingleNewsArgs>({
      query: GET_SINGLE_NEWS_ITEM_QUERY,
      variables: {
        input: {
          slug: query.slug as string,
          lang: locale as ContentLanguage,
        },
      },
    }),

    apolloClient
      .query<GetNamespaceQuery, QueryGetNamespaceArgs>({
        query: GET_NAMESPACE_QUERY,
        variables: {
          input: {
            lang: locale as ContentLanguage,
            namespace: 'Newspages',
          },
        },
      })
      .then((variables) => {
        // map data here to reduce data processing in component
        return JSON.parse(variables.data.getNamespace.fields)
      }),
  ])

  return {
    newsItem,
    namespace,
  }
}

export default withMainLayout(NewsItem)
