import { useRouteMatch } from 'react-router-dom'
import React, { useCallback, useEffect, useState } from 'react';
import shortid from 'shortid';
import { List, notification } from 'antd';

import socket from '../../socket';
import SelfCameraView from '../../components/SelfCameraView';
import useStreaming from '../../hooks/useStreaming';
import Participant from './Participant';

const Conference = () => {
    const [peerId] = useState(shortid.generate())
    const [cameraStream, setCameraStream] = useState()
    const [participants, setParticipants] = useState([])
    const [isProducing, setIsProducing] = useState()
    const [isRoomStarted, setIsRoomStarted] = useState()
    
    let match = useRouteMatch();
    const roomName = match.params.roomName

    const onUserJoined = user => {
        console.log('onUserDisconnected', user)

        notification.success({
            message: `${user.identifier} joined!`
        })
        setParticipants(c => [
            ...c,
            user
        ])
    }

    const onUserDisconnected = async user => {
        console.log('onUserDisconnected', user)
        notification.success({
            message: `${user.identifier} disconnected!`
        })
        setParticipants(c => c.filter(v => v.identifier !== user.identifier))
    }

    const onNewProducer =  async producer => {
        setParticipants(participants => participants.map(p => {
            if (p.identifier === producer.peerId) {
                if (producer.kind === 'video') {
                    return {
                        ...p,
                        media: {
                            ...p.media,
                            videoProducerId : producer.producerId
                        }
                    }
                }
                if (producer.kind === 'audio') {
                    return {
                        ...p,
                        media: {
                            ...p.media,
                            audioProducerId : producer.producerId
                        }
                    }
                }
            }
            return p
        }))
    }

    const defaultUserProfile = {
        identifier: peerId,
        displayName: 'Participant',
    }
    const {
        produce,
        joinRoom,
        leaveRoom,
        getParticipants,
        getConsumer,
        setupTransports,
    } = useStreaming({
        socket,
        room: roomName,
        socket,
        peerId,
        userProfile: defaultUserProfile,
        onUserJoined,
        onUserDisconnected,
        onNewProducer
    })

    useEffect(() => {
        const startConnection = async _ => {
            await joinRoom()
            await setupTransports()
            setIsRoomStarted(true)
        }

        startConnection()
        .then(async _ => {
            const participants = await getParticipants()
            setParticipants(participants)
        })

        return async () => {
            await leaveRoom()
        }
    }, [])

    useEffect(() => {
        const startBroadcast = async () => {
            await produce(cameraStream)
            setIsProducing(true)
        }
        if (cameraStream && !isProducing) {
            startBroadcast()
        }
        
    }, [cameraStream, isProducing])

    return (
        <div className="w-screen h-screen">
            <div className="fixed justify-center w-screen h-screen left-0 top-0 bg-black z-0">
                <div
                    className="relative w-full h-full overflow-hidden"
                    style={{
                            height: 'calc(100vw * 9 / 16)'
                    }}>
                    <SelfCameraView
                        onCameraStreamStarted={stream => setCameraStream(stream)}
                    />
                </div>
            </div>
            
            {/* Overlay */}
            <div className="overlay">
                <div className="flex justify-center w-full">
                    <h3 className="z-10 font-bold text-gray-800 text-xl">{roomName}</h3>
                </div>
                <div className="flex justify-center absolute bottom-0 left-0 bg-white w-full p-2">
                    <List
                        className="w-full"
                        dataSource={participants}
                        grid={{
                            gutter: 16,
                            xs: 2,
                            sm: 2,
                            md: 4,
                            xl: 6,
                            xxl: 8,
                        }}
                        renderItem={
                            item => {

                                return (
                                    <List.Item
                                        key={item.identifier}
                                    >
                                        <Participant
                                            displayName={item.displayName}
                                            toConsumePeerId={item.identifier}
                                            audioProducerId={item?.media?.audioProducerId}
                                            videoProducerId={item?.media?.videoProducerId}
                                            getVideoConsumer={() => getConsumer({ toConsumePeerId: item.identifier, kind: 'video' })}
                                            getAudioConsumer={() => getConsumer({ toConsumePeerId: item.identifier, kind: 'audio' })}
                                            isSelf={item.identifier === peerId}
                                        />
                                    </List.Item>
                                )
                            }
                        }
                    />
                </div>
            </div>
        </div>
    )
}

export default Conference
