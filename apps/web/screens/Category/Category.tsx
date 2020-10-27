import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import intersection from 'lodash/intersection'
import { theme } from '@island.is/island-ui/theme'
import {
  Text,
  Stack,
  Box,
  Breadcrumbs,
  Hidden,
  Select,
  AccordionCard,
  LinkCard,
  Option,
  Link,
  FocusableBox,
  ColorSchemeContext,
} from '@island.is/island-ui/core'
import { Card, Sidebar } from '@island.is/web/components'
import { useI18n } from '@island.is/web/i18n'
import routeNames from '@island.is/web/i18n/routeNames'
import { withMainLayout } from '@island.is/web/layouts/main'
import { Screen } from '@island.is/web/types'
import {
  GET_NAMESPACE_QUERY,
  GET_ARTICLES_QUERY,
  GET_CATEGORIES_QUERY,
  GET_LIFE_EVENTS_IN_CATEGORY_QUERY,
} from '@island.is/web/screens/queries'
import { CategoryLayout } from '@island.is/web/screens/Layouts/Layouts'

import { useNamespace } from '@island.is/web/hooks'
import useContentfulId from '@island.is/web/hooks/useContentfulId'
import {
  GetLifeEventsInCategoryQuery,
  GetNamespaceQuery,
  GetArticlesQuery,
  QueryGetArticlesArgs,
  ContentLanguage,
  QueryGetNamespaceArgs,
  GetArticleCategoriesQuery,
  QueryGetArticleCategoriesArgs,
  QueryGetLifeEventsInCategoryArgs,
  Image,
  ArticleGroup,
} from '../../graphql/schema'
import { CustomNextError } from '@island.is/web/units/errors'

type Articles = GetArticlesQuery['getArticles']
type LifeEvents = GetLifeEventsInCategoryQuery['getLifeEventsInCategory']

interface CategoryProps {
  articles: Articles
  categories: GetArticleCategoriesQuery['getArticleCategories']
  namespace: GetNamespaceQuery['getNamespace']
  lifeEvents: LifeEvents
  slug: string
}

const Category: Screen<CategoryProps> = ({
  articles,
  lifeEvents,
  categories,
  namespace,
  slug,
}) => {
  const itemsRef = useRef<Array<HTMLElement | null>>([])
  const [hash, setHash] = useState<string>('')
  const { activeLocale, t } = useI18n()
  const Router = useRouter()
  const n = useNamespace(namespace)
  const { makePath } = routeNames(activeLocale)

  const getCurrentCategory = () => categories.find((x) => x.slug === slug)

  const scrollToSelectOnMobile = (e) => {
    if (e.currentTarget && typeof window === 'object') {
      if (window.innerWidth < theme.breakpoints.md) {
        const rect = e.currentTarget.getBoundingClientRect()
        const px = rect.top + window.scrollY - 16
        window.scrollTo(0, px)
      }
    }
  }

  // group articles
  const { groups, cards, otherArticles } = articles.reduce(
    (content, article) => {
      // check if this is not the main category for this article
      if (article?.category?.title !== getCurrentCategory().title) {
        content.otherArticles.push(article)
        return content
      }

      if (article?.group?.slug && !content.groups[article?.group?.slug]) {
        // group does not exist create the collection
        content.groups[article?.group?.slug] = {
          title: article?.group?.title,
          description: article?.group?.description,
          articles: [article],
          groupSlug: article?.group?.slug,
          importance: article?.group?.importance,
        }
      } else if (article?.group?.slug) {
        // group should exists push into collection
        content.groups[article?.group?.slug].articles.push(article)
      } else {
        // this article belongs to no group
        content.cards.push(article)
      }
      return content
    },
    {
      groups: {},
      cards: [],
      otherArticles: [],
    },
  )

  // Get all available subgroups.
  const availableSubgroups = articles
    .map((article) => article.subgroup)
    .filter(
      (value, index, all) =>
        all.findIndex((t) => JSON.stringify(t) === JSON.stringify(value)) ===
        index,
    )
    .filter((x) => x)

  useContentfulId(getCurrentCategory()?.id)

  // find current category in categories list
  const category = getCurrentCategory()

  useEffect(() => {
    const hashMatch = window.location.hash ?? ''
    const hashString = hashMatch.replace('#', '')
    setHash(hashString)
  }, [Router])

  const sidebarCategoryLinks = categories.map((c) => ({
    title: c.title,
    active: c.slug === Router.query.slug,
    href: makePath('ArticleCategory', '/[slug]'),
    as: makePath('ArticleCategory', c.slug),
  }))

  const categoryOptions = categories.map((c) => ({
    label: c.title,
    value: c.slug,
  }))

  const groupArticlesBySubgroup = (articles: Articles, groupSlug?: string) => {
    const bySubgroup = articles.reduce((result, item) => {
      const key = item?.subgroup?.title ?? 'unknown'

      return {
        ...result,
        [key]: [...(result[key] || []), item],
      }
    }, {})

    // add "other" articles as well
    const articlesBySubgroup = otherArticles.reduce((result, item) => {
      const titles = item.otherSubgroups.map((x) => x.title)
      const subgroupsFound = intersection(Object.keys(result), titles)
      const key = 'unknown'

      // if there is no sub group found then at least show it in the group
      if (
        !subgroupsFound.length &&
        item.otherGroups.find((x) => x.slug === groupSlug)
      ) {
        return {
          ...result,
          [key]: [...(result[key] || []), item],
        }
      }

      return subgroupsFound.reduce((r, k) => {
        return {
          ...r,
          [k]: [...r[k], item],
        }
      }, result)
    }, bySubgroup)

    return { articlesBySubgroup }
  }

  const handleAccordionClick = (groupSlug: string) => {
    let newHash = hash.replace('#', '')
    const hashArray = newHash.split(',')

    if (hash === '') {
      newHash = `${groupSlug}`
    } else {
      if (hashArray.indexOf(groupSlug) > -1) {
        hashArray.splice(hashArray.indexOf(groupSlug), 1)
        newHash = hashArray.join(',')
      } else {
        newHash = newHash.concat(`,${groupSlug}`)
      }
    }

    setHash(newHash)
    Router.replace(
      makePath('ArticleCategory', '/[slug]'),
      makePath('ArticleCategory', category.slug + `#${newHash}`),
    )
  }

  const sortArticles = (articles: Articles) => {
    // Sort articles by importance (which defaults to 0).
    // If both articles being compared have the same importance we sort by comparing their titles.
    const sortedArticles = articles.sort((a, b) =>
      a.importance > b.importance
        ? -1
        : a.importance === b.importance && a.title.localeCompare(b.title),
    )

    // If it's sorted alphabetically we need to be able to communicate that.
    const isSortedAlphabetically =
      JSON.stringify(sortedArticles) ===
      JSON.stringify(
        [...articles].sort((a, b) => a.title.localeCompare(b.title)),
      )

    return { sortedArticles, isSortedAlphabetically }
  }

  const sortSubgroups = (articlesBySubgroup: Record<string, Articles>) =>
    Object.keys(articlesBySubgroup).sort((a, b) => {
      // 'unknown' is a valid subgroup key but we'll sort it to the bottom
      if (a === 'unknown') {
        return 1
      } else if (b === 'unknown') {
        return -1
      }

      // Look up the subgroups being sorted and find+compare their importance.
      // If their importance is equal we sort alphabetically.
      const foundA = availableSubgroups.find((subgroup) => subgroup.title === a)
      const foundB = availableSubgroups.find((subgroup) => subgroup.title === b)

      if (foundA && foundB) {
        return foundA.importance > foundB.importance
          ? -1
          : foundA.importance === foundB.importance &&
              foundA.title.localeCompare(foundB.title)
      }

      // Fall back to alphabet
      return a.localeCompare(b)
    })

  const sortedGroups = Object.values(
    groups,
  ).sort((a: ArticleGroup, b: ArticleGroup) =>
    a.importance > b.importance
      ? -1
      : a.importance === b.importance && a.title.localeCompare(b.title, 'is'),
  )

  return (
    <>
      <Head>
        <title>{category.title} | Ísland.is</title>
      </Head>
      <CategoryLayout
        sidebar={
          <Sidebar
            bullet="none"
            items={sidebarCategoryLinks}
            title={n('sidebarHeader')}
          />
        }
        belowContent={
          <ColorSchemeContext.Provider value={{ colorScheme: 'blue' }}>
            <Stack space={2}>
              {sortedGroups.map(({ groupSlug }, index) => {
                const { title, description, articles } = groups[groupSlug]

                const { articlesBySubgroup } = groupArticlesBySubgroup(
                  articles,
                  groupSlug,
                )

                const sortedSubgroupKeys = sortSubgroups(articlesBySubgroup)
                const expanded = hash.includes(groupSlug)

                return (
                  <div
                    key={index}
                    id={groupSlug}
                    ref={(el) => (itemsRef.current[index] = el)}
                  >
                    <AccordionCard
                      id={`accordion-item-${groupSlug}`}
                      label={title}
                      labelUse="h2"
                      labelVariant="h3"
                      startExpanded={expanded}
                      visibleContent={description}
                      onClick={() => {
                        handleAccordionClick(groupSlug)
                      }}
                    >
                      <Box paddingTop={2}>
                        {sortedSubgroupKeys.map((subgroup, index) => {
                          const { sortedArticles } = sortArticles(
                            articlesBySubgroup[subgroup],
                          )

                          // Articles with 1 subgroup only have the "other" group and don't get a heading.
                          const hasSubgroups = sortedSubgroupKeys.length > 1

                          const noSubgroupNameKeys = [
                            'unknown',
                            'undefined',
                            'null',
                          ]

                          // Rename unknown group to 'Other'
                          const subgroupName =
                            noSubgroupNameKeys.indexOf(subgroup) !== -1 ||
                            !subgroup
                              ? n('other')
                              : subgroup

                          const heading = hasSubgroups ? subgroupName : ''

                          return (
                            <React.Fragment key={subgroup}>
                              {heading && (
                                <Text
                                  variant="h5"
                                  as="h3"
                                  paddingBottom={3}
                                  paddingTop={index === 0 ? 0 : 3}
                                >
                                  {heading}
                                </Text>
                              )}
                              <Stack space={2}>
                                {sortedArticles.map(
                                  ({
                                    title,
                                    slug,
                                    containsApplicationForm,
                                  }) => {
                                    return (
                                      <FocusableBox
                                        key={slug}
                                        href={makePath('article', '/[slug]')}
                                        as={makePath('article', slug)}
                                        borderRadius="large"
                                      >
                                        {({ isFocused }) => (
                                          <LinkCard
                                            isFocused={isFocused}
                                            tag={
                                              containsApplicationForm &&
                                              n('applicationProcess', 'Umsókn')
                                            }
                                          >
                                            {title}
                                          </LinkCard>
                                        )}
                                      </FocusableBox>
                                    )
                                  },
                                )}
                              </Stack>
                            </React.Fragment>
                          )
                        })}
                      </Box>
                    </AccordionCard>
                  </div>
                )
              })}
              {lifeEvents.map(
                ({ title, slug, intro, thumbnail, image }, index) => {
                  return (
                    <Card
                      key={index}
                      href={makePath('lifeEvent', '[slug]')}
                      as={makePath('lifeEvent', slug)}
                      description={intro}
                      title={title}
                      image={(thumbnail || image) as Image}
                      tags={[
                        {
                          title: n('categoryTag'),
                        },
                      ]}
                    />
                  )
                },
              )}
              {cards.map(({ title, content, slug }, index) => {
                return (
                  <Card
                    key={index}
                    title={title}
                    description={content}
                    href={makePath('article', '/[slug]')}
                    as={makePath('article', slug)}
                  />
                )
              })}
            </Stack>
          </ColorSchemeContext.Provider>
        }
      >
        <Box paddingBottom={2}>
          <Breadcrumbs>
            <Link href={makePath()}>Ísland.is</Link>
          </Breadcrumbs>
        </Box>

        <Hidden above="sm">
          <Box onClick={scrollToSelectOnMobile}>
            <Select
              label={t.serviceCategories}
              defaultValue={{
                label: category.title,
                value: category.slug,
              }}
              onChange={({ value }: Option) => {
                const slug = value as string

                Router.push(
                  makePath('ArticleCategory', '/[slug]'),
                  makePath('ArticleCategory', slug),
                )
              }}
              isSearchable={false}
              options={categoryOptions}
              name="categories"
            />
          </Box>
        </Hidden>
        <Text variant="h1" as="h1" paddingTop={[4, 4, 0]} paddingBottom={2}>
          {category.title}
        </Text>
        <Text variant="intro" as="p">
          {category.description}
        </Text>
      </CategoryLayout>
    </>
  )
}

Category.getInitialProps = async ({ apolloClient, locale, query }) => {
  const slug = query.slug as string

  const [
    {
      data: { getArticles: articles },
    },
    {
      data: { getLifeEventsInCategory: lifeEvents },
    },
    {
      data: { getArticleCategories },
    },
    namespace,
  ] = await Promise.all([
    apolloClient.query<GetArticlesQuery, QueryGetArticlesArgs>({
      query: GET_ARTICLES_QUERY,
      variables: {
        input: {
          lang: locale as ContentLanguage,
          category: slug,
          size: 150,
        },
      },
    }),
    apolloClient.query<
      GetLifeEventsInCategoryQuery,
      QueryGetLifeEventsInCategoryArgs
    >({
      query: GET_LIFE_EVENTS_IN_CATEGORY_QUERY,
      variables: {
        input: {
          slug,
          lang: locale as ContentLanguage,
        },
      },
    }),
    apolloClient.query<
      GetArticleCategoriesQuery,
      QueryGetArticleCategoriesArgs
    >({
      query: GET_CATEGORIES_QUERY,
      variables: {
        input: {
          lang: locale as ContentLanguage,
        },
      },
    }),
    apolloClient
      .query<GetNamespaceQuery, QueryGetNamespaceArgs>({
        query: GET_NAMESPACE_QUERY,
        variables: {
          input: {
            namespace: 'Categories',
            lang: locale,
          },
        },
      })
      .then((res) => JSON.parse(res.data.getNamespace.fields)),
  ])

  const categoryExists = getArticleCategories.some(
    (category) => category.slug === slug,
  )

  // if requested category si not in returned list of categories we assume it does not exist
  if (!categoryExists) {
    throw new CustomNextError(404, 'Category not found')
  }

  return {
    articles,
    lifeEvents,
    categories: getArticleCategories,
    namespace,
    slug,
  }
}

export default withMainLayout(Category)
