const generateSpeech = require('google-tts-api');
const fs = require('fs');
const got = require('got');
const gTTS = require('gtts');
const socketIO = require('socket.io');
const express = require('express');
const app=express();
const server = require("./server");
const io = require('socket.io')(server);

 async function processTextAndGenerateSpeech(transcription) {
    try {

  const url = 'https://api.openai.com/v1/engines/davinci/completions';
  const params = {
    "prompt": transcription,
    "max_tokens": 30,
    "temperature": 0.3,
    "frequency_penalty": 0.0
  };
  const headers = {
    'Authorization': 'Bearer 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',
  };
  const response = await got.post(url, { json: params, headers: headers }).json();
    const generatedText = response.choices[0].text;
    console.log("Generated Output:", generatedText);

const gtts = new gTTS(generatedText, 'en');
const outputFile = "Voice.mp3";

gtts.save(outputFile, function (err, result) {
  if (err) {
    throw new Error(err);
  }
  console.log("Text to speech converted!");

  io.on('connection', (socket) => {
    socket.on('audio', () => {
      const file = fs.readFileSync('Voice.mp3');
      console.log('Emitting audioFile event');
      socket.emit('audioFile', { audio: file.toString('base64') });
    });
  });

});
} catch (error) {
console.error('Error processing text:', error);
}
}

module.exports = processTextAndGenerateSpeech;
