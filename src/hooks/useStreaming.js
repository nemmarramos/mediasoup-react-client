import { Device } from "mediasoup-client";
import { useCallback, useEffect, useState } from "react"
import shortid from "shortid";

const CAM_VIDEO_SIMULCAST_ENCODINGS =
[
  { maxBitrate:  96000, scaleResolutionDownBy: 4 },
  { maxBitrate: 680000, scaleResolutionDownBy: 1 },
];

export default function useStreaming({
    socket,
    room,
    peerId,
    userProfile,
    onUserJoined,
    onUserDisconnected
}) {
    const device = new Device();
    const [rtpCapabilities, setRtpCapabilities] = useState()
    const [isBroadcasting, setIsBroadcasting] = useState(false)
    const [isVideoSharingEnabled] = useState(false)
    const [isAudioSharingEnabled] = useState(false)

    useEffect(() => {
        socket.on('userJoined', onUserJoined)
        socket.on('userDisconnected', onUserDisconnected)
        return () => {
            socket.removeAllListeners();
        }
    }, [])

    // const initiateDevice = _ => {
    //     return new Promise(resolve => {
    //         if (!device) {
    //             console.log('initiate device')
    //             let device = new Device();
    //             setDevice(device, resolve);
    //         }
    //     })
    // }

    const getConsumer = async ({ toConsumePeerId, kind }) => {
        console.log('getConsumer toConsumePeerId', toConsumePeerId)
        const transport = await createTransport();
        const consumerOptions = await getConsumerOptions({ toConsumePeerId, kind })
        const consumer = await transport.consume(consumerOptions)
        return consumer;
    }
    
    const getParticipants = async _ => {
        const participants = await new Promise(resolve => {
            socket.emit('getParticipants', {
                room,
                peerId,
                userProfile
            }, resolve)
        })

        return participants
    }

    const joinRoom = async _ => {
        const roomRtpCapabilities = await new Promise(resolve => {
            socket.emit('joinRoom', {
                room,
                peerId,
                userProfile
            }, resolve)
        })

        setRtpCapabilities(roomRtpCapabilities)
    }

    const getRtpCapabilities = async _ => {
        const rtpCapabilities = await new Promise(resolve => {
            socket.emit('getRtpCapabilities', {
                room
            })
        })

        return rtpCapabilities
    }
    
    const leaveRoom = _ => {
        return new Promise(resolve => {
            socket.emit('leaveRoom', { peerId, room, userProfile }, resolve)
        })
    }
    const publish = _ => {
        return new Promise(resolve => {
            socket.emit('joinRoom', { peerId, room, userProfile }, resolve)
        })
    }

    const leaveRoomTransport = async transport => {
        transport && await transport.close()
    }

    const getConsumerOptions = ({ toConsumePeerId, kind }) => {
        return new Promise(resolve => {
            socket.emit('consume', {
                room,
                peerId,
                kind,
                toConsumePeerId
            }, resolve)
        })
    }

    const createTransport = useCallback(
        async (canProduce = false) => {

            console.log('createTransportcanProduce canProduce', canProduce)
            console.log('createTransportcanProduce device', device)
            console.log('createTransportcanProduce rtpCapabilities', rtpCapabilities)
            let currentRtpCapabilities = rtpCapabilities

            if (!currentRtpCapabilities) {
                currentRtpCapabilities = await getRtpCapabilities()
            }
            
            await loadRtpCapabilities(rtpCapabilities)
    
            const type = canProduce ? 'producer': 'consumer';
            const transportResponse = await new Promise(resolve => {
                socket.emit('createWebRTCTransport', {
                    peerId,
                    type,
                    room,
                    forceTcp: false,
                    rtpCapabilities: device.rtpCapabilities,
                }, transport => resolve(transport))
            })
    
            let transport = null;
    
            if (canProduce) {
                transport = device.createSendTransport(transportResponse.params);
                transport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
                    console.log('transport produce event', { kind, rtpParameters, appData });
                    // we may want to start out paused (if the checkboxes in the ui
                    // aren't checked, for each media type. not very clean code, here
                    // but, you know, this isn't a real application.)
                    let paused = false;
                    if (kind === 'video') {
                        paused = isVideoSharingEnabled;
                    } else if (kind === 'audio') {
                        paused = isAudioSharingEnabled;
                    }
                    // tell the server what it needs to know from us in order to set
                    // up a server-side producer object, and get back a
                    // producer.id. call callback() on success or errback() on
                    // failure.
                    // let { error, id } = await sig('send-track', {
                    //     transportId: transportOptions.id,
                    //     kind,
                    //     rtpParameters,
                    //     paused,
                    //     appData
                    // });
        
                    socket.emit('produce', {
                        room,
                        kind,
                        rtpParameters,
                        paused,
                        peerId,
                    }, callback)
                });
            } else {
                transport = await device.createRecvTransport(transportResponse.params);
            }
    
            transport.on('connect', async ({ dtlsParameters }, callback) => {
                socket.emit('connectWebRTCTransport', { type, room, dtlsParameters, peerId }, callback)
            });
            transport.on('connectionstatechange', async (state) => {
                console.log(`transport ${transport.id} connectionstatechange ${state}`);
                
                if (state === "connected") {
                    setIsBroadcasting(true)
                }
    
                // for this simple sample code, assume that transports being
                // closed is an error (we never close these transports except when
                // we leave the room)
                if (state === 'closed' || state === 'failed' || state === 'disconnected') {
                    console.log('transport closed ... leaving the room and resetting');
                  leaveRoomTransport(transport);
                }
            });
            return transport;
        },
        [rtpCapabilities],
    )

    const produce = async mediaStream => {
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
    }

    const loadRtpCapabilities = async routerRtpCapabilities => {
        if (device && !device._loaded) {
            await device.load({ routerRtpCapabilities });
        }
    }

    const unpublish = _ => {
        return new Promise(resolve => {
            socket.emit('unpublishRoom', { peerId, room }, resolve)
        })
    }

    return {
        device,
        isBroadcasting,
        getConsumer,
        produce,
        publish,
        unpublish,
        loadRtpCapabilities,
        createTransport,
        getConsumerOptions,
        joinRoom,
        leaveRoom,
        getParticipants
    }
}