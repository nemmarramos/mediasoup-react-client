import { useEffect } from "react"
import useVideoCamera from "../hooks/useVideoCamera"

const SelfCameraView = ({ onCameraStreamStarted }) => {
    const { mediaStream } = useVideoCamera("self-video-camera")

    useEffect(() => {
        if (mediaStream) onCameraStreamStarted(mediaStream)
    }, [mediaStream])
    return (
        <video
            id="self-video-camera"
            className="w-full h-full bg-black object-cover absolute top-0 left-0"
            autoPlay
            muted
            style={{
                transform: 'scaleX(-1)'
            }}
        />
    )
}

export default SelfCameraView
