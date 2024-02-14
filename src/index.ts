import 'dotenv/config'
import app from './Middlewares/expressMiddeware'
import { connectToDatabase } from './Model/database'
import router from './Router/router'

app.use('/api', router)
const startServer = async () => {
  await connectToDatabase()
  app.listen(8081, () => {
    console.log('listening on 8081')
  })
}

startServer()
