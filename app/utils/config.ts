"server only"

import { PinataSDK } from "pinata"
console.log(`PINATA_JWT ${process.env.PINATA_JWT}`)
console.log(`NEXT_PUBLIC_GATEWAY_URL ${process.env.NEXT_PUBLIC_GATEWAY_URL}`)
console.log('Using JWT:', process.env.PINATA_JWT?.slice(0, 10) + '...');
export const pinata = new PinataSDK({
  pinataJwt: `${process.env.PINATA_JWT}`,
  pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`
})