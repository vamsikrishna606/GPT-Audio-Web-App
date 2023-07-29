const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const WebSocket = require('ws');
const path=require("path");
const processTextAndGenerateSpeech = require('./textProcessing');
const fs = require('fs');

app.use(express.static('public'));
app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('audio', (audioUrl) => {
    processAudio(audioUrl);
  });
  socket.on('audio', () => {
    const file = fs.readFileSync('Voice.mp3');
    socket.emit('audioFile', { audio: file.toString('base64') });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


function processAudio(audioUrl) {
  const SAMPLE_RATE = 44100;

  const authHeader = {
    Authorization: 'ab6cf1ba45674cae8413309f5353dbeb'
  };
fetch(audioUrl)
    .then(response => response.arrayBuffer())
    .then(audioBuffer => {
      const ws = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=${SAMPLE_RATE}`, {
        headers: authHeader
      });

      ws.onopen = () => {
        console.log('WebSocket connection opened');
        ws.send(audioBuffer); // Send the audio data to the WebSocket
      };

      ws.onmessage = (message) => {
        console.log('Received message:', message);
        const messageString = message.data.toString();
        const parsedMessage = JSON.parse(messageString);
        const transcription = parsedMessage.text;
        processTextAndGenerateSpeech(transcription);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed');
        console.log('Close code:', event.code);
        console.log('Reason:', event.reason);
      };
    })
}

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports=server;


