import { useEffect, useState } from 'react';
import { Col, Row, Button } from 'antd'
import shortid from 'shortid'

import socket from './socket';
import { getDevice } from './mediasoup';

const constraints = {
    audio: true,
    video: true
};

const peerId = shortid.generate()

const Producer = ({ roomName }) => {
    const [isBroadcasting, setIsBroadcasting] = useState(false)
    const [device, setDevice] = useState()

    useEffect(() => {
        startCamera()

        return () => {
            // stopCamera()
        }
    }, [])

    const startCamera = _ => {
        navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
            var video = document.getElementById("producer-videocam");
            video.srcObject = stream;

            stream.getAudioTracks().forEach(track => {
              track.enabled = true
            });
        })
        .catch(function(err) {
            console.log(err.name + ": " + err.message);
        });
    }

    const loadRouterRtpCapabilities = async routerRtpCapabilities => {
        setDevice(await getDevice({ routerRtpCapabilities }))
        setIsBroadcasting(true)

        socket.emit('publishRoom', { peerId, room: roomName }, loadRouterRtpCapabilities)

    }

    const onPublish = _ => {
        socket.emit('publishRoom', { peerId, room: roomName }, loadRouterRtpCapabilities)
    }
    const onUnpublish = _ => {
        socket.emit('unpublishRoom', { peerId, room: roomName }, () => setIsBroadcasting(false))
    }
    
    return (
        <Row style={{ width: "100%" }} gutter={32}>
            <Col span={24} lg={12}>
                <p>Producer</p>
                <p>Status: {isBroadcasting ? 'Live' : 'Offline' }</p>
                <video
                    id="producer-videocam" 
                    style={{
                        height: "100%",
                        width: "100%",
                        background: 'black'
                    }}
                    autoPlay
                    muted
                />
            </Col>
            <Col span={24} lg={12}>
                {
                    !isBroadcasting ? (
                        <Button onClick={onPublish}>Publish</Button>
                    ) : (
                        <Button onClick={onUnpublish}>Unpublish</Button>
                    )
                }
            </Col>
        </Row>
    )
}

export default Producer
