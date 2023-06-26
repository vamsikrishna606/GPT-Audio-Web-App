
const recordButton = document.getElementById('recordButton');
const resultDiv = document.getElementById('result');

let mediaRecorder;
let audioChunks = [];
let silenceThreshold = -60;
let silenceDuration = 3000; 
let silenceTimer;
let recognition; 
let isRecording = false; 


recordButton.addEventListener('click', () => {
  if (recordButton.textContent === 'Record') {
    recordButton.textContent = 'Stop';
    startRecording();
  } else {
    recordButton.textContent = 'Record';
    stopRecording();
  }
});

function startRecording() {
 
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.fftSize);

      silenceTimer = setTimeout(stopRecording, silenceDuration);

      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);

        analyser.getByteTimeDomainData(dataArray);
        if (isSilent(dataArray)) {
          resetSilenceTimer();
        }
      });

      setTimeout(stopRecording, 5000);
    })
    .catch((error) => {
      console.error('Error accessing microphone:', error);
    });
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
  
      clearTimeout(silenceTimer);
  
      const audioBlob = new Blob(audioChunks);
      const audioUrl = URL.createObjectURL(audioBlob);
      socket.emit('audio', audioUrl);
  
      audioChunks = [];
    }
  }

//check if the audio data is silent
function isSilent(dataArray) {
  const sum = dataArray.reduce((acc, value) => acc + value, 0);
  const average = sum / dataArray.length;
  const volume = 20 * Math.log10(average / 128); // Calculate volume in dB

  return volume <= silenceThreshold;
}

//reset the silence detection timer
function resetSilenceTimer() {
  clearTimeout(silenceTimer);
  silenceTimer = setTimeout(stopRecording, silenceDuration);
}


