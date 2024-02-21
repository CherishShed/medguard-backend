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
  '/healthworker/dashboardStatistics',
  passport.authenticate('jwt', { session: false }),
  EmployeeController.dashBoardStatistics
)

export default router
