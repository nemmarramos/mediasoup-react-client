import { Button, Form, Input } from 'antd'
const CreateRoomForm = ({ onFinish }) => {
    return (
        <Form
            name="create-room"
            onFinish={onFinish}
            autoComplete="off"
        >
            <Form.Item
                label="Room name"
                name="roomName"
                rules={[{ required: true, message: 'Please input room name!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 20, span: 4 }}>
                <Button type="primary" htmlType="submit">
                Submit
                </Button>
            </Form.Item>
        </Form>
    )
}

export default CreateRoomForm
