import React, {useRef, useState, useEffect} from 'react';
import file from './speech.mp3';
import {io} from 'socket.io-client'

// const socket = io('http://localhost:5000');

function App() {
    const [audioData, setAudioData] = useState([]);
    const [record, setRecord] = useState(null);
    const audioRecorderRef = useRef(null);

    
    
    // let audioRecorder;

   const  handleStartRecording = async () =>{
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            const audioRecorder = new MediaRecorder(stream);
            const datas = [];
            audioRecorder.addEventListener('dataavailable', (event) => {
              datas.push(event.data);
            })
            audioRecorder.start();
            audioRecorderRef.current = audioRecorder;
            setAudioData(datas);
        } catch {
            console.error('Error while recording audio');
        }
        
    };

    const  handleEndRecording =()=> {
        try {
            const audioRecorder = audioRecorderRef.current
              audioRecorder.addEventListener('stop', () => {
                const blob = new Blob(audioData);
                 setRecord(blob);
              });
              audioRecorder.stop();

          } catch (e) {
            console.error(e);
          }
     };

     useEffect(() => {
        const socket = io('http://localhost:5000');
        if(record){
            socket.emit('audio', record);
            console.log("end()");
        }
    },[record]);

     function handleAnswer() {
        try {
            console.log("path of speech file: ")
            let audio = new Audio(file);
            console.log("going to listen on ")
            audio.play();
            console.log("done");
        } catch (err) {
            console.error("unable to play the speech file:",err);
        }
        
     }

      

    return (
        <div className="homePage">
            <div className="recorder">
                <div className="start_recording">
                    <button id="startRecording" onClick = {handleStartRecording}>Start Recording</button>
                </div>
                <div className="end_recording">
                    <button id="endRecording" onClick={handleEndRecording} >End Recording</button>
                </div>
            </div>
            <div className="speaker">
                <button id="getAnswer" onClick={handleAnswer}>Get Answer</button>
            </div>
        </div>
    );
}

export default App;
