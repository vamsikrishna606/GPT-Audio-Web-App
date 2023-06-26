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

  const ws = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=${SAMPLE_RATE}`, {
    headers: authHeader
  });

  ws.on('open', () => {
    console.log('WebSocket connection opened');
  });

ws.on('message', async (message) => {
    console.log('Received message:', message);
    const messageString = message.toString(); 
   const parsedMessage = JSON.parse(messageString); 
    const transcription = parsedMessage.text;
     processTextAndGenerateSpeech(transcription);
  });
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', (code, reason) => {
    console.log('WebSocket connection closed');
    console.log('Close code:', code);
    console.log('Reason:', reason);
  });
}

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports=server;


