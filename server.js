const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const {backOff} = require('exponential-backoff');

const {Configuration, OpenAIApi} = require('openai');

const io = new Server(server);


//const config = new Configuration({apiKey: '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'});
const config = new Configuration({apiKey: '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'});
const openAI = new OpenAIApi(config);

 app.get('/', (req,res) => {
    res.sendFile(__dirname + '/frontend/index.html')
 });

 io.on('connection', (socket) => {
    socket.on('audio', async function(audioData)  {
        fs.writeFileSync('audioFile.mp3', audioData);
        socket.emit('audio', "audio file received");
        console.log("audio file received");
         console.log("enter into async function");
         const text =   await convertSpeechToText('audioFile.mp3');
         console.log(text);
      console.log('text received');
       
    });
 });

 async function convertSpeechToText(str) {
   console.log(str);
   try {
      const transcript = await openAI.createTranscription(fs.createReadStream(str), 'whisper-1'); 
       let val = transcript.data.text;
       console.log(transcript);
       console.log(val);
       setTimeout(() => {
         return transcript.data.text;
       }, 5000);
   } catch (e) {
     return  console.error('Unable to convert the audio to text',e)
   }
   
   // console.log("Hello Deepak")
   // console.log(transcript.data.text);
   //return transcript.data.text;
 }

 server.listen(3000, () => {
    console.log('server listening on port: 3000');
 })