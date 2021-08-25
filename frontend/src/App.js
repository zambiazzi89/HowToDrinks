import { useState } from 'react'
import Houndify from 'houndify'
import { FaMicrophone } from 'react-icons/fa'
import './App.css'

function App() {
  const [APIresponse, setAPIresponse] = useState('')

  let conversationState = null
  let voiceRequest = null
  //Fires after server responds with Response JSON
  //Info object contains useful information about the completed request
  //See https://houndify.com/reference/HoundServer
  const onResponse = (response, info) => {
    if (response.AllResults && response.AllResults.length) {
      //Pick and store appropriate ConversationState from the results.
      //This example takes the default one from the first result.
      conversationState = response.AllResults[0].ConversationState
    }

    console.log('Received response.')
    setAPIresponse(response.AllResults[0].WrittenResponseLong)
    console.log(response.stringify(undefined, 2))
    console.log(JSON.stringify(info, undefined, 2))
  }

  //Fires if error occurs during the request
  const onError = (err, info) => {
    console.log('Error: ' + JSON.stringify(err))
    console.log(JSON.stringify(info, undefined, 2))
  }

  //Fires every time backend sends a speech-to-text
  //transcript of a voice query
  //See https://houndify.com/reference/HoundPartialTranscript
  const onTranscriptionUpdate = (transcript) => {
    console.log(transcript.PartialTranscript)
  }

  function initVoiceRequest(sampleRate) {
    const voiceRequest = new Houndify.VoiceRequest({
      //Your Houndify Client ID
      clientId: '',
      authURL: '/houndifyAuth',

      //REQUEST INFO JSON
      //See https://houndify.com/reference/RequestInfo
      requestInfo: {
        UserID: 'test_user',
        Latitude: 37.388309,
        Longitude: -121.973968,
      },

      //Pass the current ConversationState stored from previous queries
      //See https://www.houndify.com/docs#conversation-state
      conversationState: conversationState,

      //Sample rate of input audio
      sampleRate: sampleRate,

      //Enable Voice Activity Detection
      //Default: true
      enableVAD: true,

      //Partial transcript, response and error handlers
      onTranscriptionUpdate: onTranscriptionUpdate,
      onResponse: (response, info) => {
        recorder.stop()
        onResponse(response, info)
      },
      onError: (err, info) => {
        recorder.stop()
        onError(err, info)
      },
    })

    return voiceRequest
  }
  const recorder = new Houndify.AudioRecorder()

  recorder.on('start', () => {
    //Initialize VoiceRequest
    voiceRequest = initVoiceRequest(recorder.sampleRate)
  })

  recorder.on('data', (data) => {
    voiceRequest.write(data)
  })

  recorder.on('end', () => {
    voiceRequest.end()
    console.log('Stopped recording. Waiting for response...')
  })

  recorder.on('error', (error) => {
    voiceRequest.abort()
    console.log('Error: ' + error)
  })

  const onMicrophoneClick = () => {
    if (recorder && recorder.isRecording()) {
      recorder.stop()
      return
    }
    recorder.start()
  }

  return (
    <div className="App">
      <h3 className="title">{`How do I make a [drink]?`}</h3>
      <button className="microphone-button" onClick={onMicrophoneClick}>
        <FaMicrophone className="mic-icon" />
      </button>
      <h4 className="response">{APIresponse}</h4>
    </div>
  )
}

export default App
