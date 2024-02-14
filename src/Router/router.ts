import express from 'express'
import 'dotenv/config'
import patientController from '../Controllers/patientController'
const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Good' })
})

router.get('/patient', patientController.getPatientInfo)

export default router
