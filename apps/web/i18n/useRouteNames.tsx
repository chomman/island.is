import { Locale, defaultLanguage } from './I18n'

const routeNames = {
  is: {
    article: 'grein',
    category: 'flokkur',
    news: 'frett',
    search: 'leit',
    landingPage: '',
    page: '',
  },
  en: {
    article: 'article',
    category: 'category',
    news: 'news',
    search: 'search',
    landingPage: '',
    page: '',
  },
}

export type PathTypes =
  | 'article'
  | 'category'
  | 'news'
  | 'search'
  | 'landingPage'
  | 'page'

export const useRouteNames = (locale: Locale = defaultLanguage) => {
  return {
    makePath: (type?: PathTypes, subfix?: string) => {
      let path = ''

      const typePath = (type && routeNames[locale][type]) ?? null

      if (locale && locale !== defaultLanguage) {
        path += '/' + locale
      }

      if (typePath) {
        path += '/' + typePath
      }

      if (subfix) {
        path += '/' + subfix
      }

      return path || '/'
    },
  }
}

export default useRouteNames
