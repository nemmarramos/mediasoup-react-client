import { Device } from 'mediasoup-client';

export const getDevice = async ({ routerRtpCapabilities }) => {
    let device = new Device();

    await device.load({ routerRtpCapabilities });

    if (!device.canProduce('video')){
        console.warn('cannot produce video');
    }

    return device;
}