import { Card } from "antd"
import Meta from "antd/lib/card/Meta"
import { useEffect } from "react";

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
const Participant = ({
    displayName,
    getVideoConsumer,
    getAudioConsumer,
    isSelf,
    toConsumePeerId
}) => {
    const videoElementId = `participant_video_${toConsumePeerId}`
    const audioElementId = `participant_audio_${toConsumePeerId}`

    const loadConsumerStream = (consumer, kind) => {
        console.log('consumer',consumer)
        const stream = new MediaStream([ consumer.track.clone() ]);
        stream.addTrack(consumer.track);
        
        if (kind === 'video') {
            var player = document.querySelector(`#${videoElementId}`);
            player.srcObject = stream;
            var promise = player.play();
    
            if (promise !== undefined) {
    
                promise.then(_ => {
                    // Autoplay started!
                }).catch(error => {
                    console.error(error)
                    // Autoplay was prevented.
    
                    // Show a "Play" button so that user can start playback.
                });
    
                }
        } else {
            var player = document.querySelector(`#${audioElementId}`);
            player.srcObject = stream;
            var promise = player.play();
    
            if (promise !== undefined) {
    
                promise.then(_ => {
                    // Autoplay started!
                }).catch(error => {
                    console.error(error)
                    // Autoplay was prevented.
    
                    // Show a "Play" button so that user can start playback.
                });
    
                }
        }
    }

    useEffect(() => {
        const connectToParticipant = async () => {
            const videoConsumer = await getVideoConsumer()
            const audioConsumer = await getAudioConsumer()

            console.log('videoConsumer', videoConsumer)
            console.log('audioConsumer', audioConsumer)
            await loadConsumerStream(videoConsumer, 'video')
            await loadConsumerStream(audioConsumer, 'audio')
        }

        if (!isSelf) {
            connectToParticipant()
        }
    }, [])
    return (
        <div
            className="w-full h-full"
        >
            <Card
                hoverable
                cover={
                    <video
                        id={videoElementId}
                    />
                } 
                style={{
                    background: getRandomColor()
                }}
            >
                <Meta title={`${displayName} ${isSelf ? '- You' : '' }`} description={`peerId: ${toConsumePeerId}`}/>
                <audio
                    id={audioElementId}
                    autoPlay
                    playsInline
                /> 
            </Card>
        </div>
    )
}

export default Participant