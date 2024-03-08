import { Vonage } from '@vonage/server-sdk'
import { AuthInterface } from '@vonage/auth'
import 'dotenv/config'
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
} as AuthInterface)

export default vonage
