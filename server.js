const express = require('express');
const {config} = require('dotenv');
const {Deepgram} = require('@deepgram/sdk');
const app = express();
const fs = require('fs');
const tts = require('google-tts-api');
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const {cors} = require('cors');
const  {Configuration, OpenAIApi} = require('openai');

config();

const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
const configuration = new Configuration({
   apiKey: process.env.OPEN_API_KEY,
});

const  openai = new OpenAIApi(configuration);
const mimetype = 'audio/wav';

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get('/',  (req,res) => {
  console.log("require");
  res.sendFile(__dirname + '/frontend/public/index.html');
  // res.sendFile(__dirname + '/index.html');
  console.log("not require");
})

 io.on('connection', (socket) => {
    console.log("connection");
    socket.on('audio', async (audioData) => {
    fs.writeFileSync('audioFile.mp3', audioData, { encoding: 'binary', flag: 'w', mode: 0o666, mimetype: 'audio/mpeg' });
    const convertText = await convertSpeechToText('audioFile.mp3');

    const res = await getGPTResponse(convertText);
    console.log(res);
    await convertTextToSpeech(res);
    });
 });

 async function getGPTResponse(convertText) {
    const prompt = `${convertText}`;
    console.log("line no 39 ")
    console.log(prompt);
    const res = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0613",
      // prompt: prompt,
      max_tokens: 10,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    console.log("line no 44");
    return res.data.choices[0].message.content;
 }

  async function convertSpeechToText(str) {
  try {
    const deepgram = new Deepgram(deepgramApiKey);
    const convertedText = await deepgram.transcription.preRecorded(
      { buffer: fs.readFileSync(str), mimetype },
      { punctuate: true, language: 'en-US' },
    );
    const text = convertedText.results.channels[0].alternatives[0].transcript;
    console.log("line no 70");
    console.log(text);                   
    return text;
    console.log(convertedText.results.channels[0].alternatives[0].transcript);
  } catch (err) {
    console.log(err.message);
    return err;
  }
  
 }

 async function convertTextToSpeech(text) {
  console.log("line no 88");
  console.log(text);
  try {
    const speech = tts.getAudioUrl(text, {
      lang: 'en',
      slow: false,
      host: 'http://translate.google.com',
    });

    const res = await fetch(speech);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync('frontend/src/speech.mp3', buffer);
  } catch (err) {
    console.error(err.message);
  }
 }

 

 server.listen(5000, () => {
    console.log('server listening on port: 5000');
 })

module.exports = app;