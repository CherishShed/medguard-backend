import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const corsOptions = {
  origin: '*',
}

app.use(cors(corsOptions))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

export default app
