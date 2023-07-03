const express = require('express');
const {Deepgram} = require('@deepgram/sdk');
const app = express();
const fs = require('fs');
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');

const deepgramApiKey = 'bdb4ae70b96dbc9938fd39947f90403837fc83d4';

const mimetype = 'audio/wav';

const io = new Server(server);

app.get('/',  (req,res) => {
  res.sendFile(__dirname + '/index.html');
})

 io.on('connection', (socket) => {
    socket.on('audio', async (audioData) => {
    fs.writeFileSync('audioFile.mp3', audioData, { encoding: 'binary', flag: 'w', mode: 0o666, mimetype: 'audio/mpeg' });
    const convertText = await convertSpeechToText('audioFile.mp3');
     //get the text and integrate the chatgpt and get the answer
     // convert text to audio 
     //play the audio file
    });
 });

  async function convertSpeechToText(str) {
  try {
    const deepgram = new Deepgram(deepgramApiKey);
    const convertedText = await deepgram.transcription.preRecorded(
      { buffer: fs.readFileSync(str), mimetype },
      { punctuate: true, language: 'en-US' },
    );
    const text = convertedText.results.channels[0].alternatives[0].transcript;
    return text;
    console.log(convertedText.results.channels[0].alternatives[0].transcript);
  } catch (err) {
    console.log(err.message);
    return err;
  }
  
 }

 

 server.listen(3000, () => {
    console.log('server listening on port: 3000');
 })

module.exports = app;