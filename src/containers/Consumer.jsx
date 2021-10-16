import { Col, Row, Button } from 'antd'
import shortid from 'shortid'
import useStreaming from '../hooks/useStreaming';

import socket from '../socket';

const peerId = shortid.generate()

const Consumer = ({ roomName }) => {
    const {
        getRtpCapabilities,
        getConsumer,
    } = useStreaming({
        room: roomName,
        socket,
        peerId
    })

    const connectToRoom = async _ => {
        const consumer = await getConsumer()

        const stream = new MediaStream();
        stream.addTrack(consumer.track);

        var video = document.querySelector("#consumer-videocam");
        video.srcObject = stream;

        var promise = video.play();

        if (promise !== undefined) {

            promise.then(_ => {

              // Autoplay started!

            }).catch(error => {
              console.error(error)
              // Autoplay was prevented.

              // Show a "Play" button so that user can start playback.
            });

          }

        return stream;
    }

    const joinRoom = async _ => {
        await connectToRoom()
    }

    return (
        <Row style={{ width: "100%" }} gutter={32}>
            <Col span={12}>
                <p>Consumer</p>
                <video
                    id="consumer-videocam" 
                    style={{
                        height: "100%",
                        width: "100%",
                        background: 'black'
                    }}
                    autoPlay
                />
            </Col>
            <Col span={12}>
                <Button onClick={joinRoom}>Join</Button>
            </Col>
        </Row>
    )
}

export default Consumer
