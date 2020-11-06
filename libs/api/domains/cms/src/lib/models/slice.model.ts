import { createUnionType } from '@nestjs/graphql'
import { ApolloError } from 'apollo-server-express'
import { Document, BLOCKS, Block } from '@contentful/rich-text-types'
import { logger } from '@island.is/logging'
import {
  ITimeline,
  IMailingListSignup,
  ISectionHeading,
  ICardSection,
  IStorySection,
  ILogoListSlice,
  ILatestNewsSlice,
  IBigBulletList,
  IStatistics,
  IProcessEntry,
  IFaqList,
  IEmbeddedVideo,
  ISectionWithImage,
  ITabSection,
  ITeamList,
  IContactUs,
  ILocation,
  ITellUsAStory,
} from '../generated/contentfulTypes'
import { Image, mapImage } from './image.model'
import { Asset, mapAsset } from './asset.model'
import {
  MailingListSignupSlice,
  mapMailingListSignup,
} from './mailingListSignupSlice.model'
import { TimelineSlice, mapTimelineSlice } from './timelineSlice.model'
import { HeadingSlice, mapHeadingSlice } from './headingSlice.model'
import { StorySlice, mapStorySlice } from './storySlice.model'
import { LinkCardSlice, mapLinkCardSlice } from './linkCardSlice.model'
import { LatestNewsSlice, mapLatestNewsSlice } from './latestNewsSlice.model'
import { LogoListSlice, mapLogoListSlice } from './logoListSlice.model'
import { BulletListSlice, mapBulletListSlice } from './bulletListSlice.model'
import { Statistics, mapStatistics } from './statistics.model'
import { Html, mapHtml } from './html.model'
import { ProcessEntry, mapProcessEntry } from './processEntry.model'
import { FaqList, mapFaqList } from './faqList.model'
import { EmbeddedVideo, mapEmbeddedVideo } from './embeddedVideo.model'
import { SectionWithImage, mapSectionWithImage } from './sectionWithImage.model'
import { TabSection, mapTabSection } from './tabSection.model'
import { TeamList, mapTeamList } from './teamList.model'
import { ContactUs, mapContactUs } from './contactUs.model'
import { Location, mapLocation } from './location.model'
import { TellUsAStory, mapTellUsAStory } from './tellUsAStory.model'

type SliceTypes =
  | ITimeline
  | IMailingListSignup
  | ISectionHeading
  | ICardSection
  | IStorySection
  | ILogoListSlice
  | ILatestNewsSlice
  | IBigBulletList
  | IStatistics
  | IProcessEntry
  | IFaqList
  | IEmbeddedVideo
  | ISectionWithImage
  | ITabSection
  | ITeamList
  | IContactUs
  | ILocation
  | ITellUsAStory

export const Slice = createUnionType({
  name: 'Slice',
  types: () => [
    TimelineSlice,
    MailingListSignupSlice,
    HeadingSlice,
    LinkCardSlice,
    StorySlice,
    LogoListSlice,
    LatestNewsSlice,
    BulletListSlice,
    Statistics,
    ProcessEntry,
    FaqList,
    EmbeddedVideo,
    SectionWithImage,
    TabSection,
    TeamList,
    ContactUs,
    Location,
    TellUsAStory,
    Html,
    Image,
    Asset,
  ],
  resolveType: (document) => document.typename, // typename is appended to request on indexing
})

export const mapSlice = (slice: SliceTypes): typeof Slice => {
  const contentType = slice.sys.contentType?.sys?.id
  switch (contentType) {
    case 'timeline':
      return mapTimelineSlice(slice as ITimeline)
    case 'mailingListSignup':
      return mapMailingListSignup(slice as IMailingListSignup)
    case 'sectionHeading':
      return mapHeadingSlice(slice as ISectionHeading)
    case 'cardSection':
      return mapLinkCardSlice(slice as ICardSection)
    case 'storySection':
      return mapStorySlice(slice as IStorySection)
    case 'logoListSlice':
      return mapLogoListSlice(slice as ILogoListSlice)
    case 'latestNewsSlice':
      return mapLatestNewsSlice(slice as ILatestNewsSlice)
    case 'bigBulletList':
      return mapBulletListSlice(slice as IBigBulletList)
    case 'statistics':
      return mapStatistics(slice as IStatistics)
    case 'processEntry':
      return mapProcessEntry(slice as IProcessEntry)
    case 'faqList':
      return mapFaqList(slice as IFaqList)
    case 'embeddedVideo':
      return mapEmbeddedVideo(slice as IEmbeddedVideo)
    case 'sectionWithImage':
      return mapSectionWithImage(slice as ISectionWithImage)
    case 'tabSection':
      return mapTabSection(slice as ITabSection)
    case 'teamList':
      return mapTeamList(slice as ITeamList)
    case 'contactUs':
      return mapContactUs(slice as IContactUs)
    case 'location':
      return mapLocation(slice as ILocation)
    case 'tellUsAStory':
      return mapTellUsAStory(slice as ITellUsAStory)
    default:
      throw new ApolloError(`Can not convert to slice: ${contentType}`)
  }
}

const isEmptyNode = (node: Block): boolean => {
  return (node?.content ?? []).every((child) => {
    return child.nodeType === 'text' && child.value === ''
  })
}

/*
if we add a slice that is not in mapper mapSlices fails for that slice.
we dont want a single slice to cause errors on a whole page so we fail them gracefully
this can e.g. happen when a developer is creating a new slice type and an editor publishes it by accident on a page
*/
export const safelyMapSlices = (data: SliceTypes): typeof Slice | null => {
  try {
    return mapSlice(data)
  } catch (error) {
    logger.warn('Failed to map slice', { error: error.message })
    return null
  }
}

export const mapDocument = (
  document: Document,
  idPrefix: string,
): Array<typeof Slice> => {
  const slices: Array<typeof Slice | null> = []
  const docs = document?.content ?? []

  docs.forEach((block, index) => {
    switch (block.nodeType) {
      case BLOCKS.EMBEDDED_ENTRY:
        slices.push(safelyMapSlices(block.data.target))
        break
      case BLOCKS.EMBEDDED_ASSET:
        if (block.data.target.fields?.file) {
          block.data.target.fields.file.details?.image
            ? slices.push(mapImage(block.data.target))
            : slices.push(mapAsset(block.data.target))
        }
        break
      default: {
        // ignore last empty paragraph because of this annoying bug:
        // https://github.com/contentful/rich-text/issues/101
        if (index === document.content.length - 1 && isEmptyNode(block)) return

        // either merge into previous html slice or create a new one
        const prev = slices[slices.length - 1]
        if (prev instanceof Html) {
          prev.document.content.push(block)
        } else {
          slices.push(mapHtml(block, `${idPrefix}:${index}`))
        }
      }
    }
  })

  return slices.filter((slice): slice is typeof Slice => Boolean(slice)) // filter out empty slices that failed mapping
}
