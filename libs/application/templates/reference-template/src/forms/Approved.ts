import {
  buildForm,
  buildIntroductionField,
  Form,
  FormModes,
} from '@island.is/application/core'

export const Approved: Form = buildForm({
  id: 'ApprovedApplicationForm',
  name: 'Samþykkt',
  mode: FormModes.APPROVED,
  children: [
    buildIntroductionField({
      id: 'approved',
      name: 'Til hamingju!',
      introduction: 'Umsókn þín hefur verið samþykkt!',
    }),
  ],
})
