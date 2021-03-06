import { MappedData } from '@island.is/api/content-search'
import { logger } from '@island.is/logging'
import { Injectable } from '@nestjs/common'
import { Entry } from 'contentful'
import isCircular from 'is-circular'
import { IArticleCategory } from '../../generated/contentfulTypes'
import { mapArticleCategory } from '../../models/articleCategory.model'
import { createTerms } from './utils'

@Injectable()
export class ArticleCategorySyncService {
  processSyncData(entries: Entry<any>[]): IArticleCategory[] {
    logger.info('Processing sync data for article category')

    // only process articles that we consider not to be empty and dont have circular structures
    return entries.filter(
      (entry: IArticleCategory): entry is IArticleCategory =>
        entry.sys.contentType.sys.id === 'articleCategory' &&
        !!entry.fields.title &&
        !isCircular(entry),
    )
  }

  doMapping(entries: IArticleCategory[]): MappedData[] {
    logger.info('Mapping article category', { count: entries.length })

    return entries
      .map<MappedData | boolean>((entry) => {
        try {
          const mapped = mapArticleCategory(entry)
          const type = 'webArticleCategory'
          return {
            _id: mapped.slug,
            title: mapped.title,
            content: mapped.description,
            type,
            termPool: createTerms([mapped.title, mapped.description]),
            response: JSON.stringify({ ...mapped, __typename: type }),
            dateCreated: entry.sys.createdAt,
            dateUpdated: new Date().getTime().toString(),
          }
        } catch (error) {
          logger.warn('Failed to import article category', {
            error: error.message,
          })
          return false
        }
      })
      .filter((value): value is MappedData => Boolean(value))
  }
}
