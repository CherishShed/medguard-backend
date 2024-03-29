import express from 'express'
import 'dotenv/config'
import patientController from '../Controllers/patientController'
import EmployeeController from '../Controllers/adminController'
import 'dotenv/config'
import passport from '../Middlewares/authMiddleware'
import authController from '../Controllers/authController'
const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Good' })
})

router.get(
  '/healthworker',
  passport.authenticate('jwt', { session: false }),
  authController.isLoggedIn
)
router.post('/healthworker/login', authController.loginUser)
router.post('/healthworker/changepassword', authController.changePassword)
router.get('/healthworker/logout', authController.logout)
router.get('/patient', patientController.getPatientInfo)
router.post('/patient/vitals', patientController.addVitals)
router.get('/medication', patientController.getMedications)
router.get(
  '/healthworker/patients',
  passport.authenticate('jwt', { session: false }),
  EmployeeController.getAllPatients
)
router.get(
  '/healthworker/patient',
  passport.authenticate('jwt', { session: false }),
  EmployeeController.getPatientInfo
)
router.get(
  '/healthworker/patient/prescription',
  passport.authenticate('jwt', { session: false }),
  EmployeeController.getPatientPrescriptions
)
router.get(
  '/healthworker/patient/singleprescription',
  passport.authenticate('jwt', { session: false }),
  EmployeeController.getSinglePrescription
)
router.post(
  '/healthworker/patient/prescription',
  passport.authenticate('jwt', { session: false }),
  EmployeeController.addPrescription
)
router.get(
  '/healthworker/dashboardStatistics',
  passport.authenticate('jwt', { session: false }),
  EmployeeController.dashBoardStatistics
)
router.patch(
  '/healthworker/patient/medication',
  passport.authenticate('jwt', { session: false }),
  EmployeeController.addMedication
)
router.get(
  '/healthworker/patient/vitals',
  passport.authenticate('jwt', { session: false }),
  EmployeeController.getPatientVitals
)

export default router
