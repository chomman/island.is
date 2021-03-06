import { Field, ObjectType, ID } from '@nestjs/graphql'

import { ILifeEventPage } from '../generated/contentfulTypes'

import { Image, mapImage } from './image.model'
import { ArticleCategory, mapArticleCategory } from './articleCategory.model'
import { Slice, mapDocument } from './slice.model'

@ObjectType()
export class LifeEventPage {
  @Field()
  typename: string

  @Field(() => ID)
  id: string

  @Field()
  title: string

  @Field()
  slug: string

  @Field({ nullable: true })
  intro?: string

  @Field({ nullable: true })
  image?: Image

  @Field({ nullable: true })
  thumbnail?: Image

  @Field(() => [Slice])
  content: Array<typeof Slice>

  @Field(() => ArticleCategory, { nullable: true })
  category?: ArticleCategory
}

export const mapLifeEventPage = ({
  fields,
  sys,
}: ILifeEventPage): LifeEventPage => ({
  typename: 'LifeEventPage',
  id: sys.id,
  title: fields.title ?? '',
  slug: fields.slug ?? '',
  intro: fields.intro ?? '',
  image: mapImage(fields.image),
  thumbnail: mapImage(fields.thumbnail),
  content: fields?.content
    ? mapDocument(fields.content, sys.id + ':content')
    : [],
  category: fields.category ? mapArticleCategory(fields.category) : null,
})
