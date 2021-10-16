import { useEffect, useState } from "react";

const constraints = {
    audio: true,
    video: {width: 320, height: 180, facingMode: "user"}
};

export default function useVideoCamera(elementId) {
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
            var video = document.getElementById(elementId);
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