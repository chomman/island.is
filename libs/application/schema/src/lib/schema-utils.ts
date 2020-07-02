import {
  Form,
  FormItemTypes,
  FormNode,
  FormScreen,
  Question,
  Section,
  SubSection,
} from '@island.is/application/schema'

const isValidScreen = (node: FormNode): boolean => {
  if (!node.children) {
    // only Field has no children attribute
    return true
  }
  switch (node.type) {
    case FormItemTypes.MULTI_FIELD: {
      return true
    }

    case FormItemTypes.REPEATER: {
      return true
    }
    default: {
      return false
    }
  }
}

export const getScreensForFormNode = (
  node: FormNode,
  onlyQuestions: boolean = false,
): FormScreen[] => {
  const { children } = node
  if (isValidScreen(node)) {
    if (onlyQuestions && 'isQuestion' in node && node.isQuestion) {
      return [node as FormScreen]
    } else if (!onlyQuestions) {
      return [node as FormScreen]
    }
  }

  let leafs: FormScreen[] = []
  let newLeafs: FormScreen[] = []
  if (children) {
    for (let i = 0; i < children.length; i++) {
      newLeafs = getScreensForFormNode(children[i])
      if (newLeafs.length) {
        leafs = [...leafs, ...newLeafs]
      }
    }
  }
  return leafs
}

export const getScreensForForm = (form: Form): FormScreen[] => {
  return getScreensForFormNode(form)
}

export const getQuestionsInForm = (form: Form): Question[] => {
  return getScreensForFormNode(form, true) as Question[]
}

export function getSectionsInForm(form: Form): Section[] {
  const sections: Section[] = []
  form.children.forEach((child) => {
    if (child.type === FormItemTypes.SECTION) {
      sections.push(child)
    }
  })
  return sections
}
export function getSubSectionsInSection(section: Section): SubSection[] {
  const subSections: SubSection[] = []
  section.children.forEach((child) => {
    if (child.type === FormItemTypes.SUB_SECTION) {
      subSections.push(child)
    }
  })
  return subSections
}

export function findSectionIndexForScreen(
  form: Form,
  screen: FormScreen,
): number {
  const sections = getSectionsInForm(form)
  if (!sections.length) {
    return -1
  }
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const screensInSection = getScreensForFormNode(section)
    if (screensInSection.find(({ id }) => id === screen.id) !== undefined) {
      return i
    }
  }
  return -1
}

export function findSubSectionIndexForScreen(
  section: Section,
  screen: FormScreen,
): number {
  const subSections = getSubSectionsInSection(section)
  if (!subSections.length) {
    return -1
  }
  for (let i = 0; i < subSections.length; i++) {
    const subSection = subSections[i]
    const screensInSection = getScreensForFormNode(subSection)
    if (screensInSection.find(({ id }) => id === screen.id) !== undefined) {
      return i
    }
  }
  return -1
}
