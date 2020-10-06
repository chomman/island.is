import { Field, ObjectType } from '@nestjs/graphql'

import { INews } from '../generated/contentfulTypes'

import { Image, mapImage } from './image.model'
import { Author, mapAuthor } from './author.model'
import { Slice, mapDocument } from './slice.model'

@ObjectType()
export class News {
  @Field()
  typename: string

  @Field()
  id: string

  @Field()
  slug: string

  @Field()
  title: string

  @Field()
  subtitle: string

  @Field(() => Author, { nullable: true })
  author: Author

  @Field()
  intro: string

  @Field(() => Image, { nullable: true })
  image?: Image

  @Field()
  date: string

  @Field(() => [Slice], { nullable: true })
  content: Array<typeof Slice>
}

export const mapNews = ({ fields, sys }: INews): News => ({
  typename: 'News',
  id: sys.id,
  slug: fields.slug ?? '',
  title: fields.title ?? '',
  subtitle: fields.subtitle ?? '',
  author: fields.author && mapAuthor(fields.author),
  intro: fields.intro ?? '',
  image: mapImage(fields.image),
  date: fields.date ?? '',
  content: fields.content
    ? mapDocument(fields.content, sys.id + ':content')
    : [],
})
