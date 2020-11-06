import { Accordion, AccordionItem, Box, Text } from '@island.is/island-ui/core'
import React, { useContext, useEffect, useState } from 'react'
import { FormFooter } from '../../../shared-components/FormFooter'
import Modal from '../../../shared-components/Modal/Modal'
import {
  constructConclusion,
  getAppealDecitionText,
} from '../../../utils/stepHelper'
import * as Constants from '../../../utils/constants'
import { TIME_FORMAT, formatDate } from '@island.is/judicial-system/formatters'
import { parseTransition } from '../../../utils/formatters'
import { AppealDecisionRole } from '../../../types'
import AccordionListItem from '@island.is/judicial-system-web/src/shared-components/AccordionListItem/AccordionListItem'
import {
  Case,
  CaseAppealDecision,
  CaseState,
  CaseTransition,
  SignatureResponse,
  TransitionCase,
} from '@island.is/judicial-system/types'
import { userContext } from '@island.is/judicial-system-web/src/utils/userContext'
import { useHistory, useParams } from 'react-router-dom'
import { PageLayout } from '@island.is/judicial-system-web/src/shared-components/PageLayout/PageLayout'
import PoliceRequestAccordionItem from '@island.is/judicial-system-web/src/shared-components/PoliceRequestAccordionItem/PoliceRequestAccordionItem'
import * as style from './Confirmation.treat'
import {
  CaseQuery,
  TransitionCaseMutation,
} from '@island.is/judicial-system-web/src/graphql'
import { gql, useMutation, useQuery } from '@apollo/client'
import { PendingSignature } from '@island.is/judicial-system-web/src/graphql/schema'

export const RequestSignatureMutation = gql`
  mutation RequestSignatureMutation($input: RequestSignatureInput!) {
    requestSignature(input: $input) {
      controlCode
      documentToken
    }
  }
`

export const SignatureConfirmationQuery = gql`
  query ConfirmSignatureQuery($input: SignatureConfirmationQueryInput!) {
    confirmSignature(input: $input) {
      documentSigned
      code
      message
    }
  }
`

interface SigningModalProps {
  caseId: string
  pendingSignature: PendingSignature
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const SigningModal: React.FC<SigningModalProps> = (
  props: SigningModalProps,
) => {
  const history = useHistory()
  const [signatureResponse, setSignatureResponse] = useState<
    SignatureResponse
  >()

  const { data } = useQuery(SignatureConfirmationQuery, {
    variables: {
      input: {
        caseId: props.caseId,
        documentToken: props.pendingSignature.documentToken,
      },
    },
    fetchPolicy: 'no-cache',
  })
  const resSignatureResponse = data?.confirmSignature

  useEffect(() => {
    if (resSignatureResponse) {
      setSignatureResponse(resSignatureResponse)
    }
  }, [resSignatureResponse, setSignatureResponse])

  const renderContolCode = () => {
    return (
      <>
        <Box marginBottom={2}>
          <Text variant="h2" color="blue400">
            {`Öryggistala: ${props.pendingSignature.controlCode}`}
          </Text>
        </Box>
        <Text>
          Þetta er ekki pin-númerið. Staðfestu aðeins innskráningu ef sama
          öryggistala birtist í símanum þínum.
        </Text>
      </>
    )
  }

  return (
    <Modal
      title={
        !signatureResponse
          ? 'Rafræn undirritun'
          : signatureResponse.documentSigned
          ? 'Úrskurður hefur verið staðfestur og undirritaður'
          : signatureResponse.code === 7023 // User cancelled
          ? 'Notandi hætti við undirritun'
          : 'Undirritun tókst ekki'
      }
      text={
        !signatureResponse
          ? renderContolCode()
          : signatureResponse.documentSigned
          ? 'Tilkynning hefur verið send á ákæranda og dómara sem kvað upp úrskurð.'
          : 'Vinsamlegast reynið aftur svo hægt sé að senda úrskurðinn með undirritun.'
      }
      secondaryButtonText={
        !signatureResponse
          ? null
          : signatureResponse.documentSigned
          ? 'Loka glugga'
          : 'Loka og reyna aftur'
      }
      primaryButtonText={!signatureResponse ? null : 'Gefa endurgjöf á gáttina'}
      handlePrimaryButtonClick={() => {
        history.push(Constants.FEEDBACK_FORM_ROUTE)
      }}
      handleSecondaryButtonClick={async () => {
        if (signatureResponse?.documentSigned === true) {
          history.push(Constants.DETENTION_REQUESTS_ROUTE)
        } else {
          props.setModalVisible(false)
        }
      }}
    />
  )
}

export const Confirmation: React.FC = () => {
  const [workingCase, setWorkingCase] = useState<Case>(null)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [pendingSignature, setPendingSignature] = useState<PendingSignature>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { id } = useParams<{ id: string }>()
  const { user } = useContext(userContext)
  const { data } = useQuery(CaseQuery, {
    variables: { input: { id: id } },
    fetchPolicy: 'no-cache',
  })

  const resCase = data?.case

  useEffect(() => {
    document.title = 'Yfirlit úrskurðar - Réttarvörslugátt'
  }, [])

  useEffect(() => {
    const getCurrentCase = async () => {
      setIsLoading(true)
      setWorkingCase(resCase)
      setIsLoading(false)
    }
    if (id && !workingCase && resCase) {
      getCurrentCase()
    }
  }, [id, setIsLoading, workingCase, setWorkingCase, resCase])

  useEffect(() => {
    if (!modalVisible) {
      setPendingSignature(null)
    }
  }, [modalVisible, setPendingSignature])

  const [transitionCaseMutation] = useMutation(TransitionCaseMutation)

  const transitionCase = async (id: string, transitionCase: TransitionCase) => {
    const { data } = await transitionCaseMutation({
      variables: { input: { id, ...transitionCase } },
    })

    const resCase = data?.transitionCase

    if (resCase) {
      // Do smoething with the result. In particular, we want the modified timestamp passed between
      // the client and the backend so that we can handle multiple simultanious updates.
    }

    return resCase
  }

  const [requestSignatureMutation] = useMutation(RequestSignatureMutation)

  const requestSignature = async (id: string) => {
    const { data } = await requestSignatureMutation({
      variables: { input: { caseId: id } },
    })

    return data?.requestSignature
  }

  const handleNextButtonClick = async () => {
    try {
      if (workingCase.state === CaseState.SUBMITTED) {
        // Parse the transition request
        const transitionRequest = parseTransition(
          workingCase.modified,
          workingCase.rejecting ? CaseTransition.REJECT : CaseTransition.ACCEPT,
        )

        // Transition the case
        const resCase = await transitionCase(workingCase.id, transitionRequest)

        if (!resCase) {
          // Improve error handling at some point
          console.log('Transition failing')
          return false
        }

        return true
      }
    } catch (e) {
      return false
    }
  }

  return (
    <PageLayout activeSubSection={1} activeSection={5} isLoading={isLoading}>
      {workingCase ? (
        <>
          <Box marginBottom={1}>
            <Text as="h1" variant="h1">
              Yfirlit úrskurðar
            </Text>
          </Box>
          <Box display="flex" marginBottom={10}>
            <Box marginRight={2}>
              <Text variant="small">{`Krafa stofnuð: ${formatDate(
                workingCase.created,
                'P',
              )}`}</Text>
            </Box>
            <Text variant="small">{`Þinghald: ${formatDate(
              workingCase.courtStartTime,
              'P',
            )}`}</Text>
          </Box>
          <Box component="section" marginBottom={7}>
            <Text
              variant="h2"
              as="h2"
            >{`Mál nr. ${workingCase.courtCaseNumber}`}</Text>
            <Text fontWeight="semiBold">{`LÖKE málsnr. ${workingCase.policeCaseNumber}`}</Text>
          </Box>
          <Box marginBottom={9}>
            <Accordion>
              <PoliceRequestAccordionItem workingCase={workingCase} />
              <AccordionItem id="id_2" label="Þingbók" labelVariant="h3">
                <Box marginBottom={2}>
                  <Text variant="h4" as="h4">
                    Upplýsingar
                  </Text>
                </Box>
                <Box marginBottom={3}>
                  <Text>
                    {`Þinghald frá kl. ${formatDate(
                      workingCase.courtStartTime,
                      TIME_FORMAT,
                    )} til kl. ${formatDate(
                      workingCase.courtEndTime,
                      TIME_FORMAT,
                    )} ${formatDate(workingCase.courtEndTime, 'PP')}`}
                  </Text>
                </Box>
                <AccordionListItem title="Krafa lögreglu">
                  <span className={style.breakSpaces}>
                    {workingCase.policeDemands}
                  </span>
                </AccordionListItem>
                <AccordionListItem title="Viðstaddir">
                  <span className={style.breakSpaces}>
                    {workingCase.courtAttendees}
                  </span>
                </AccordionListItem>
                <AccordionListItem title="Dómskjöl">
                  Rannsóknargögn málsins liggja frammi. Krafa lögreglu þingmerkt
                  nr. 1.
                </AccordionListItem>
                <AccordionListItem title="Réttindi kærða">
                  Kærða er bent á að honum sé óskylt að svara spurningum er
                  varða brot það sem honum er gefið að sök, sbr. 2. mgr. 113.
                  gr. laga nr. 88/2008. Kærði er enn fremur áminntur um
                  sannsögli kjósi hann að tjá sig um sakarefnið, sbr. 1. mgr.
                  114. gr. sömu laga.
                </AccordionListItem>
                <AccordionListItem title="Afstaða kærða">
                  <span className={style.breakSpaces}>
                    {workingCase.accusedPlea}
                  </span>
                </AccordionListItem>
                <AccordionListItem title="Málflutningur">
                  <span className={style.breakSpaces}>
                    {workingCase.litigationPresentations}
                  </span>
                </AccordionListItem>
              </AccordionItem>
            </Accordion>
          </Box>
          <Box component="section" marginBottom={8}>
            <Box marginBottom={2}>
              <Text as="h4" variant="h4">
                Úrskurður Héraðsdóms
              </Text>
            </Box>
            <Box marginBottom={7}>
              <Text variant="eyebrow" color="blue400">
                Niðurstaða úrskurðar
              </Text>
              <span className={style.breakSpaces}>{workingCase.ruling}</span>
            </Box>
          </Box>
          <Box component="section" marginBottom={7}>
            <Box marginBottom={2}>
              <Text as="h4" variant="h4">
                Úrskurðarorð
              </Text>
            </Box>
            <Box marginBottom={3}>{constructConclusion(workingCase)}</Box>
            <Text variant="h4" fontWeight="light">
              Úrskurðarorðið er lesið í heyranda hljóði að viðstöddum kærða,
              verjanda hans, túlki og aðstoðarsaksóknara.
            </Text>
          </Box>
          <Box component="section" marginBottom={3}>
            <Box marginBottom={1}>
              <Text as="h4" variant="h4">
                Ákvörðun um kæru
              </Text>
            </Box>
            <Box marginBottom={1}>
              <Text variant="h4" fontWeight="light">
                Dómari leiðbeinir málsaðilum um rétt þeirra til að kæra úrskurð
                þennan til Landsréttar innan þriggja sólarhringa. Dómari bendir
                kærða á að honum sé heimilt að bera atriði er lúta að framkvæmd
                gæsluvarðhaldsins undir dómara.
              </Text>
            </Box>
            <Box marginBottom={1}>
              <Text variant="h4">
                {getAppealDecitionText(
                  AppealDecisionRole.ACCUSED,
                  workingCase.accusedAppealDecision,
                )}
              </Text>
            </Box>
            <Text variant="h4">
              {getAppealDecitionText(
                AppealDecisionRole.PROSECUTOR,
                workingCase.prosecutorAppealDecision,
              )}
            </Text>
          </Box>
          {(workingCase.accusedAppealAnnouncement ||
            workingCase.prosecutorAppealAnnouncement) && (
            <Box component="section" marginBottom={6}>
              {workingCase.accusedAppealAnnouncement &&
                workingCase.accusedAppealDecision ===
                  CaseAppealDecision.APPEAL && (
                  <Box marginBottom={2}>
                    <Text variant="eyebrow" color="blue400">
                      Yfirlýsing um kæru kærða
                    </Text>
                    <Text variant="intro">
                      {workingCase.accusedAppealAnnouncement}
                    </Text>
                  </Box>
                )}
              {workingCase.prosecutorAppealAnnouncement &&
                workingCase.prosecutorAppealDecision ===
                  CaseAppealDecision.APPEAL && (
                  <Box marginBottom={2}>
                    <Text variant="eyebrow" color="blue400">
                      Yfirlýsing um kæru sækjanda
                    </Text>
                    <Text variant="intro">
                      {workingCase.prosecutorAppealAnnouncement}
                    </Text>
                  </Box>
                )}
            </Box>
          )}
          <Box marginBottom={15}>
            <Text variant="h3">
              {workingCase?.judge
                ? `${workingCase?.judge.name} ${workingCase?.judge.title}`
                : `${user?.name} ${user?.title}`}
            </Text>
          </Box>
          <FormFooter
            nextUrl={Constants.DETENTION_REQUESTS_ROUTE}
            nextButtonText="Staðfesta úrskurð"
            onNextButtonClick={async () => {
              // Set loading indicator on the Continue button in the footer
              setIsLoading(true)

              // Transition case from submitted state to either accepted or rejected
              await handleNextButtonClick()

              // Request signature to get control code
              const pendingSignature = await requestSignature(workingCase.id)

              if (pendingSignature) {
                setPendingSignature(pendingSignature)
                setModalVisible(true)
                setIsLoading(false)
              }
            }}
            nextIsLoading={isLoading}
          />
          {modalVisible && (
            <SigningModal
              caseId={workingCase?.id}
              pendingSignature={pendingSignature}
              setModalVisible={setModalVisible}
            />
          )}
        </>
      ) : null}
    </PageLayout>
  )
}

export default Confirmation
