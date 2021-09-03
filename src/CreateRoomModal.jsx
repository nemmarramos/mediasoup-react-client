import { Modal } from "antd";
import CreateRoomForm from "./CreateRoomForm";

const CreateRoomModal = ({ onCreateRoom, ...props }) => {
    return (
        <Modal
            title="Create room"
            footer={null}
            destroyOnClose
            {...props}
        >
            <CreateRoomForm onFinish={v => onCreateRoom(v.roomName)}/>
        </Modal>
    )
}

export default CreateRoomModal
