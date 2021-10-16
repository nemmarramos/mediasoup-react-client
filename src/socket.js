import { io } from "socket.io-client";
const socketUrl = process.env.REACT_APP_STREAM_SOCKET_URL

var socket = io(socketUrl, {
    reconnection: true,
    reconnectionDelayMax: 1000,
    transports:["websocket"]
});

export const getSocket = () => {
    if (socket.disconnected) {
        let newSocket = io(socketUrl, {
            reconnection: true,
            reconnectionDelayMax: 10,
            forceNew: true,
        });
        return newSocket
    }

    return socket
}

export default socket