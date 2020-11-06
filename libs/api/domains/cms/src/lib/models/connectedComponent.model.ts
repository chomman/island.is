import { Field, ID, ObjectType } from '@nestjs/graphql'
import graphqlTypeJson from 'graphql-type-json'
import {
  ISliceConnectedComponent,
  ISliceConnectedComponentFields,
} from '../generated/contentfulTypes'

@ObjectType()
export class ConnectedComponent {
  @Field()
  typename: string

  @Field(() => ID)
  id: string

  @Field()
  title: string

  @Field({ nullable: true })
  type?: string

  @Field(() => graphqlTypeJson, { nullable: true })
  json?: Record<string, any>
}

const parseJson = (fields: ISliceConnectedComponentFields) => {
  const json = fields?.json ?? null

  if (!json) return null

  switch (fields.type) {
    case 'Skilavottord/CompanyListConnected':
      if (typeof json === 'object' && Object.keys(json).length) {
        console.log('Skilavottord/CompanyListConnected data:', json)

        return {
          graphqlLink: json.graphqlLink,
        }
      }

      break
    case 'Skilavottord/CompanyList':
      console.log('Skilavottord/CompanyList data:', json)

      if (Array.isArray(json)) {
        return json.map((x) => ({
          address: x.address ?? '',
          postnumber: x.postnumber ?? '',
          city: x.city ?? '',
          phone: x.phone ?? '',
          website: x.website ?? '',
        }))
      }

      break
    default:
      break
  }

  return json
}

export const mapConnectedComponent = ({
  fields,
  sys,
}: ISliceConnectedComponent): ConnectedComponent => ({
  typename: 'ConnectedComponent',
  id: sys.id,
  title: fields?.title ?? '',
  type: fields?.type ?? 'None',
  json: fields?.json ? parseJson(fields) : null,
})