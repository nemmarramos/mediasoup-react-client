import mediasoupClient, { Device } from 'mediasoup-client';
let device = new Device();

export const loadDevice = async ({ routerRtpCapabilities }) => {

    console.log('routerRtpCapabilities', routerRtpCapabilities)
    if (!device.loaded) {
        await device.load({ routerRtpCapabilities });
    }
    console.log('device', device)

    if (!device.canProduce('video')){
        console.warn('cannot produce video');
    }

    return device;
}