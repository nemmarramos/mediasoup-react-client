import { Col, Row, Button } from 'antd'
import { useState } from 'react';
import shortid from 'shortid'
import useStreaming from './hooks/useStreaming';

import socket from './socket';

const peerId = shortid.generate()

const Consumer = ({ roomName }) => {
    const [isVideoSharingEnabled, setIsVideoSharingEnabled] = useState(false)
    const [isAudioSharingEnabled, setIsAudioSharingEnabled] = useState(false)
    const { device, loadRtpCapabilities } = useStreaming({ room: roomName })

    const createTransport = async _ => {
        const transportResponse = await new Promise(resolve => {
            // ??
            socket.emit('createWebRTCTransport', {
                peerId,
                type: 'consumer',
                room: roomName,
                forceTcp: false,
                rtpCapabilities: device.rtpCapabilities,
            }, transport => resolve(transport))
        })

        // ??
        const transport = await device.createRecvTransport(transportResponse.params);

        transport.on('connect', async ({ dtlsParameters }, callback) => {
            console.log('onConnect:dtlsParameters', dtlsParameters)

            // ??
            socket.emit('connectWebRTCTransport', { type: 'consumer', room: roomName, dtlsParameters, peerId }, callback)
        });
        transport.on('connectionstatechange', async (state) => {
            console.log(`transport ${transport.id} connectionstatechange ${state}`);
            // for this simple sample code, assume that transports being
            // closed is an error (we never close these transports except when
            // we leave the room)
            if (state === 'closed' || state === 'failed' || state === 'disconnected') {
                console.log('transport closed ... leaving the room and resetting');
            //   leaveRoom();
            }
        });
        console.log('transport', transport)
        return transport;
    }


    const connectToRoom = async routerRtpCapabilities => {
        await loadRtpCapabilities(routerRtpCapabilities)
        const transport = await createTransport();

        const consumerOptions = await new Promise(resolve => {
            socket.emit('consume', {
                room: roomName,
                peerId,
                kind: 'video'
                // transportId: transportOptions.id,
                // kind,
                // rtpParameters,
                // paused,
                // appData
            }, resolve)
        })

        console.log('consumerOptions', consumerOptions)

        const consumer = await transport.consume(consumerOptions)

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
        socket.emit('joinRoom', { peerId, room: roomName }, connectToRoom)
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
