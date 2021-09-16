import { useState } from 'react';
import { Col, Row, Button } from 'antd'
import shortid from 'shortid'

import socket from './socket';
import useStreaming from './hooks/useStreaming';
import useVideoCamera from './hooks/useVideoCamera';

const CAM_VIDEO_SIMULCAST_ENCODINGS =
[
  { maxBitrate:  96000, scaleResolutionDownBy: 4 },
  { maxBitrate: 680000, scaleResolutionDownBy: 1 },
];

const peerId = shortid.generate()

const Producer = ({ roomName }) => {
    const [isBroadcasting, setIsBroadcasting] = useState(false)
    const {
        device,
        createTransport,
        loadRtpCapabilities
    } = useStreaming({
        room: roomName,
        socket,
        peerId
    })
    const { mediaStream } = useVideoCamera()

    const loadProducer = async routerRtpCapabilities => {
        await loadRtpCapabilities(routerRtpCapabilities)
    }

    // const createTransport1 = async _ => {
    //     const transportResponse = await new Promise(resolve => {
    //         // ??
    //         socket.emit('createWebRTCTransport', {
    //             peerId,
    //             type: 'producer',
    //             room: roomName,
    //             forceTcp: false,
    //             rtpCapabilities: device.rtpCapabilities,
    //         }, transport => resolve(transport))
    //     })

    //     // ??
    //     const transport = device.createSendTransport(transportResponse.params);

    //     transport.on('connect',  ({ dtlsParameters }, callback, errback) => {
    //         console.log('onConnect:dtlsParameters', dtlsParameters)
    //         // ??
    //         socket.emit('connectWebRTCTransport', {
    //             type: 'producer',
    //             room: roomName,
    //             dtlsParameters,
    //             peerId
    //         }, callback)
    //     });

    //     transport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
    //         console.log('transport produce event', { kind, rtpParameters, appData });
    //         // we may want to start out paused (if the checkboxes in the ui
    //         // aren't checked, for each media type. not very clean code, here
    //         // but, you know, this isn't a real application.)
    //         let paused = false;
    //         if (kind === 'video') {
    //             paused = isVideoSharingEnabled;
    //         } else if (kind === 'audio') {
    //             paused = isAudioSharingEnabled;
    //         }
    //         // tell the server what it needs to know from us in order to set
    //         // up a server-side producer object, and get back a
    //         // producer.id. call callback() on success or errback() on
    //         // failure.
    //         // let { error, id } = await sig('send-track', {
    //         //     transportId: transportOptions.id,
    //         //     kind,
    //         //     rtpParameters,
    //         //     paused,
    //         //     appData
    //         // });
    //         const track = {
    //             transportId: transportResponse.params.id,
    //             kind,
    //             rtpParameters,
    //             paused,
    //             appData
    //         }
    //         console.log('track', track)
    //         console.log('emit produce')

    //         socket.emit('produce', {
    //             // transportId: transportOptions.id,
    //             room: roomName,
    //             kind,
    //             rtpParameters,
    //             paused,
    //             peerId,
    //             // appData
    //         }, callback)
    //     });
    //     transport.on('connectionstatechange', async (state) => {
    //         console.log(`transport ${transport.id} connectionstatechange ${state}`);
    //         // for this simple sample code, assume that transports being
    //         // closed is an error (we never close these transports except when
    //         // we leave the room)
    //         if (state === 'closed' || state === 'failed' || state === 'disconnected') {
    //             console.log('transport closed ... leaving the room and resetting');
    //             setIsBroadcasting(false)
    //         //   leaveRoom();
    //         }
    //     });
    //     console.log('createTransport return transport', transport)
    //     return transport;
    // }

    const startVideoCameraBroadcast = async routerRtpCapabilities => {
        try {
            console.log('startVideoCameraBroadcast:device', device);

            await loadProducer(routerRtpCapabilities);
            const transport = await createTransport(true);
            console.log('startVideoCameraBroadcast:transport', transport);

            console.log('mediaStream.getVideoTracks()', mediaStream.getVideoTracks())

            await transport.produce({
                track: mediaStream.getVideoTracks()[0],
                encodings: CAM_VIDEO_SIMULCAST_ENCODINGS,
                appData: { mediaTag: 'cam-video' }
            });

            await transport.produce({
                track: mediaStream.getAudioTracks()[0],
                appData: { mediaTag: 'cam-audio' }
            });

            setIsBroadcasting(true)
        } catch (error) {
            console.error(error)
        }

    }

    const onPublish = _ => {
        socket.emit('joinRoom', { peerId, room: roomName }, startVideoCameraBroadcast)
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
