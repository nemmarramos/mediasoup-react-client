import { io } from "socket.io-client";
var socket = io("http://localhost:8080", {
    reconnection: true,
    reconnectionDelayMax: 1000
});

export const getSocket = () => {
    if (socket.disconnected) {
        let newSocket = io("http://localhost:8080", {
            reconnection: true,
            reconnectionDelayMax: 10,
            forceNew: true,
        });
        return newSocket
    }

    return socket
}

export default socket