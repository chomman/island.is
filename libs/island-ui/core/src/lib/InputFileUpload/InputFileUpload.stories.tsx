import React, { useState } from 'react'

import { InputFileUpload } from './InputFileUpload'
import { fileToObject } from './InputFileUpload.utils'
import { UploadFile } from './InputFileUpload.types'

import { Box } from '../Box'
import { ContentBlock } from '../ContentBlock'

export default {
  title: 'Core/InputFileUpload',
  component: InputFileUpload,
}

enum ActionTypes {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
  UPDATE = 'UPDATE',
}

const uploadFile = (file: UploadFile, dispatch) => {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest()

    req.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100)

        dispatch({
          type: ActionTypes.UPDATE,
          payload: { file, status: 'uploading', percent },
        })
      }
    })

    req.upload.addEventListener('load', (event) => {
      dispatch({
        type: ActionTypes.UPDATE,
        payload: { file, status: 'done', percent: 100 },
      })
      resolve(req.response)
    })

    req.upload.addEventListener('error', (event) => {
      dispatch({
        type: ActionTypes.UPDATE,
        payload: { file, status: 'error', percent: 0 },
      })
      reject(req.response)
    })

    const formData = new FormData()
    formData.append('file', file.originalFileObj, file.name)

    req.open('POST', 'http://localhost:5000/')
    req.send(formData)
  })
}

const initialUploadFiles: UploadFile[] = []

function reducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD:
      const updatedFiles = state.concat(action.payload.newFiles)
      return updatedFiles
    case ActionTypes.REMOVE:
      const updatedFileList = state.filter(
        (file) => file.name !== action.payload.fileToRemove.name,
      )
      return [...updatedFileList]
    case ActionTypes.UPDATE:
      const updatedStatusList = state.map((file: UploadFile) => {
        if (file.name == action.payload.file.name) {
          file.status = action.payload.status
          file.percent = action.payload.percent
        }
        return file
      })
      return [...updatedStatusList]
    default:
      throw new Error()
  }
}

export const Default = () => {
  const [state, dispatch] = React.useReducer(reducer, initialUploadFiles)
  const [error, setError] = useState<string | undefined>(undefined)

  const onChange = (newFiles: File[]) => {
    const newUploadFiles = newFiles.map((f) => fileToObject(f))

    setError(undefined)

    newUploadFiles.forEach((f: UploadFile) => {
      uploadFile(f, dispatch).catch((e) => {
        setError('An error occurred uploading one or more files')
      })
    })

    dispatch({
      type: ActionTypes.ADD,
      payload: {
        newFiles: newUploadFiles,
      },
    })
  }

  const remove = (fileToRemove: UploadFile) => {
    dispatch({
      type: ActionTypes.REMOVE,
      payload: {
        fileToRemove,
      },
    })
  }

  return (
    <ContentBlock>
      <Box padding={[2, 2, 3]} background="blue100">
        <InputFileUpload
          fileList={state}
          header="Drag documents here to upload"
          description="Documents accepted with extension: .pdf, .docx, .rtf"
          buttonLabel="Select documents to upload"
          onChange={onChange}
          onRemove={remove}
          errorMessage={state.length > 0 && error}
        />
      </Box>
    </ContentBlock>
  )
}