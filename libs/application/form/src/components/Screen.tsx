import React, { FC, useCallback } from 'react'
import { useMutation } from '@apollo/client'
import {
  FormValue,
  FormItemTypes,
  Schema,
  Section,
  FormType,
  ExternalData,
} from '@island.is/application/schema'
import { Typography, Box, Button, Divider } from '@island.is/island-ui/core'
import {
  CREATE_APPLICATION,
  UPDATE_APPLICATION,
} from '@island.is/application/graphql'
import deepmerge from 'deepmerge'
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form'
import { FormScreen } from '../types'
import FormMultiField from './FormMultiField'
import FormField from './FormField'
import { resolver } from '../validation/resolver'
import FormRepeater from './FormRepeater'
import FormExternalDataProvider from './FormExternalDataProvider'
import { verifyExternalData } from '../utils'

type ScreenProps = {
  answerAndGoToNextScreen(Answers): void
  formValue: FormValue
  formTypeId: FormType
  addExternalData(data: ExternalData): void
  answerQuestions(Answers): void
  dataSchema: Schema
  externalData: ExternalData
  shouldSubmit?: boolean
  expandRepeater(): void
  prevScreen(): void
  screen: FormScreen
  section?: Section
  applicationId?: string
  setApplicationId(id: string): void
}

const Screen: FC<ScreenProps> = ({
  formValue,
  formTypeId,
  addExternalData,
  answerQuestions,
  dataSchema,
  expandRepeater,
  externalData,
  answerAndGoToNextScreen,
  prevScreen,
  shouldSubmit = false,
  screen,
  section,
  applicationId,
  setApplicationId,
}) => {
  const hookFormData = useForm<FormValue>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: formValue,
    shouldUnregister: false,
    resolver,
    context: { dataSchema, formNode: screen },
  })

  const [createApplication, { loading: createPending }] = useMutation(
    CREATE_APPLICATION,
    {
      onCompleted({ createApplication }) {
        setApplicationId(createApplication.id)
      },
    },
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updateApplication, { loading, data: updateData }] = useMutation(
    UPDATE_APPLICATION,
  )

  const { handleSubmit, errors, reset } = hookFormData

  const goBack = useCallback(() => {
    // using deepmerge to prevent some weird react-hook-form read-only bugs
    reset(deepmerge({}, formValue))
    prevScreen()
  }, [formValue, prevScreen, reset])

  const onSubmit: SubmitHandler<FormValue> = async (data) => {
    if (shouldSubmit) {
      // call submit mutation
      console.log('here we will submit', formValue)
    } else {
      if (applicationId) {
        await updateApplication({
          variables: {
            input: {
              id: applicationId,
              typeId: formTypeId,
              answers: data,
            },
          },
        })
      } else {
        await createApplication({
          variables: {
            input: {
              applicant: '123456-1234',
              state: 'PENDING',
              attachments: {},
              typeId: formTypeId,
              assignee: '123456-1235',
              externalId: 'some_id',
              answers: data,
            },
          },
        })
      }
      console.log('these were my answers:', data)
      answerAndGoToNextScreen(data)
    }
  }

  function canProceed(): boolean {
    const isLoadingOrPending = loading || createPending
    if (screen.type === FormItemTypes.EXTERNAL_DATA_PROVIDER) {
      return (
        !isLoadingOrPending &&
        verifyExternalData(externalData, screen.dataProviders)
      )
    }
    return !isLoadingOrPending
  }

  return (
    <FormProvider {...hookFormData}>
      <Box
        component="form"
        display="flex"
        flexDirection="column"
        justifyContent="spaceBetween"
        key={screen.id}
        height="full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Box flexGrow={1}>
          {section && <Typography color="dark300">{section.name}</Typography>}
          <Typography variant="h2">{screen.name}</Typography>
          <Box>
            {screen.type === FormItemTypes.REPEATER ? (
              <FormRepeater
                expandRepeater={expandRepeater}
                repeater={screen}
                formValue={formValue}
              />
            ) : screen.type === FormItemTypes.MULTI_FIELD ? (
              <FormMultiField
                answerQuestions={answerQuestions}
                errors={errors}
                multiField={screen}
                formValue={formValue}
                applicationId={applicationId}
              />
            ) : screen.type === FormItemTypes.EXTERNAL_DATA_PROVIDER ? (
              <FormExternalDataProvider
                addExternalData={addExternalData}
                applicationId={applicationId}
                externalData={externalData}
                externalDataProvider={screen}
                formValue={formValue}
              />
            ) : (
              <FormField
                autoFocus
                errors={errors}
                field={screen}
                formValue={formValue}
                applicationId={applicationId}
              />
            )}
          </Box>
        </Box>
        <Box marginTop={[3, 3, 0]}>
          <Divider weight="regular" />
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="spaceBetween"
            paddingTop={[1, 4]}
            paddingBottom={[1, 5]}
          >
            <Box display="inlineFlex" padding={2} paddingLeft="none">
              <Button variant="text" leftIcon="arrowLeft" onClick={goBack}>
                Til baka
              </Button>
            </Box>
            <Box display="inlineFlex" padding={2} paddingRight="none">
              {shouldSubmit ? (
                <Button
                  loading={loading || createPending}
                  disabled={!canProceed()}
                  htmlType="submit"
                >
                  Submit
                </Button>
              ) : (
                <Button
                  loading={loading || createPending}
                  disabled={!canProceed()}
                  variant="text"
                  icon="arrowRight"
                  htmlType="submit"
                >
                  Halda áfram
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </FormProvider>
  )
}

export default Screen
