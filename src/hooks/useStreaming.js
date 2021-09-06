import { Device } from "mediasoup-client";
import { useEffect, useState } from "react"


export default function useStreaming({ room }) {
    const [device, setDevice] = useState();

    const initiateDevice = _ => {
        console.log('initiate device')
        let device = new Device();
        setDevice(device);
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
        loadRtpCapabilities
    }
}