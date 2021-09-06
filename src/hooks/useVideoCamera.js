import { useEffect, useState } from "react";

const constraints = {
    audio: true,
    video: true
};

export default function useVideoCamera() {
    const [mediaStream, setMediaStream] = useState()

    useEffect(() => {
        async function startCameraAsync() {
            const mediaStream = await startCamera()
            setMediaStream(mediaStream)
        }
        startCameraAsync();
        
        return () => {
            // stopCamera()
        }
    }, [])

    const startCamera = _ => {
        return navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
            var video = document.getElementById("producer-videocam");
            video.srcObject = stream;

            stream.getAudioTracks().forEach(track => {
              track.enabled = true
            });

            return stream;
        })
        .catch(function(err) {
            console.log(err.name + ": " + err.message);
        });
    }

    return {
        mediaStream
    }
}