import express from 'express'
import 'dotenv/config'
import patientController from '../Controllers/patientController'
import EmployeeController from '../Controllers/adminController'
const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Good' })
})

router.get('/patient', patientController.getPatientInfo)
router.post('/patient/vitals', patientController.addVitals)
router.get('/medication', patientController.getMedications)
router.get('/healthworker/patients', EmployeeController.getAllPatients)
router.post('/healthworker/linkClerk', EmployeeController.linkClerkId)
export default router
