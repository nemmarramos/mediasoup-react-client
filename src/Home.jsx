import { useState } from "react";
import { Button } from "antd";
import CreateRoomModal from "./CreateRoomModal";
import { useHistory } from "react-router-dom";

function Home() {
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false)
  let history = useHistory();
  const createRoomButtonAction = _ => setShowCreateRoomModal(true)
  const goToRoom = roomName => history.push(`/room/${roomName}`)
  return (
    <div className="home">
      <div className="container">
        <CreateRoomModal
          visible={showCreateRoomModal}
          onCancel={_ => setShowCreateRoomModal(false)}
          onCreateRoom={goToRoom}
          destroyOnClose
        />
        <Button type="primary" onClick={createRoomButtonAction}>Create room</Button>
      </div>
    </div>
  );
}

export default Home;
