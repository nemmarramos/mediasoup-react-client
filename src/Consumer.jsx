import { Col, Row, Button } from 'antd'
import shortid from 'shortid'

import socket from './socket';

const peerId = shortid.generate()

const Consumer = ({ roomName }) => {
    const joinRoom = _ => {
        socket.emit('joinRoom', { room: roomName })
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
                    muted
                />
            </Col>
            <Col span={12}>
                <Button onClick={joinRoom}>Join</Button>
            </Col>
        </Row>
    )
}

export default Consumer
