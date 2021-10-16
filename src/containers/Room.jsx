import { useRouteMatch } from 'react-router-dom'
import { Col, Row } from 'antd'
import Producer from './Producer';
import Consumer from './Consumer';

const Room = () => {
    let match = useRouteMatch();
    const roomName = match.params.roomName

    return (
        <div className="container">
            Room: <strong>{roomName}</strong>

            <Row style={{ width: "100%" }}>
                <Col span={24}>
                    <div className="panel">
                        <Producer roomName={roomName}/>
                    </div>
                </Col>
                <Col span={24}>
                    <div className="panel">
                        <Consumer roomName={roomName}/>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default Room
