import { useState } from 'react';
import { Col, Row, Button } from 'antd'
import shortid from 'shortid'

import socket from '../socket';
import useVideoCamera from '../hooks/useVideoCamera';
import useStreaming from '../hooks/useStreaming';

const peerId = shortid.generate()

const Producer = ({ roomName }) => {
    const {
        device,
        isBroadcasting,
        produce,
        unpublish,
    } = useStreaming({
        room: roomName,
        socket,
        peerId
    })
    const { mediaStream } = useVideoCamera()

    const onPublish = async _ => {
        try {
            console.log('startVideoCameraBroadcast:device', device);
            await produce(mediaStream)
        } catch (error) {
            console.error(error)
        }
    }

    const onUnpublish = async _ => {
        await unpublish()
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
