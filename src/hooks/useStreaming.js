import { Device } from "mediasoup-client";
import { useEffect, useState } from "react"


export default function useStreaming({
    room,
    socket,
    peerId
}) {
    const [device, setDevice] = useState();
    const [isVideoSharingEnabled] = useState(false)
    const [isAudioSharingEnabled] = useState(false)

    const initiateDevice = _ => {
        console.log('initiate device')
        let device = new Device();
        setDevice(device);
    }

    const getRtpCapabilities = async _ => {
        return new Promise(resolve => {
            socket.emit('joinRoom', { peerId, room }, resolve)
        })
    }

    const leaveRoom = async transport => {
        transport && await transport.close()
    }

    const getConsumerOptions = () => {
        return new Promise(resolve => {
            socket.emit('consume', {
                room,
                peerId,
                kind: 'video',
            }, resolve)
        })
    }

    const createTransport = async canProduce => {
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
            // for this simple sample code, assume that transports being
            // closed is an error (we never close these transports except when
            // we leave the room)
            if (state === 'closed' || state === 'failed' || state === 'disconnected') {
                console.log('transport closed ... leaving the room and resetting');
              leaveRoom(transport);
            }
        });
        console.log('transport', transport)
        return transport;
    }

    const loadRtpCapabilities = async routerRtpCapabilities => {
        if (!device._loaded) {
            await device.load({ routerRtpCapabilities });
        }
    }

    useEffect(() => {
        initiateDevice();
    }, [room])

    return {
        device,
        getRtpCapabilities,
        loadRtpCapabilities,
        createTransport,
        getConsumerOptions
    }
}