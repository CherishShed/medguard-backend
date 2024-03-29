"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const patientController_1 = __importDefault(require("../Controllers/patientController"));
const adminController_1 = __importDefault(require("../Controllers/adminController"));
require("dotenv/config");
const authMiddleware_1 = __importDefault(require("../Middlewares/authMiddleware"));
const authController_1 = __importDefault(require("../Controllers/authController"));
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Good' });
});
router.get('/healthworker', authMiddleware_1.default.authenticate('jwt', { session: false }), authController_1.default.isLoggedIn);
router.post('/healthworker/login', authController_1.default.loginUser);
router.post('/healthworker/changepassword', authController_1.default.changePassword);
router.get('/healthworker/logout', authController_1.default.logout);
router.get('/patient', patientController_1.default.getPatientInfo);
router.post('/patient/vitals', patientController_1.default.addVitals);
router.get('/medication', patientController_1.default.getMedications);
router.get('/healthworker/patients', authMiddleware_1.default.authenticate('jwt', { session: false }), adminController_1.default.getAllPatients);
router.get('/healthworker/patient', authMiddleware_1.default.authenticate('jwt', { session: false }), adminController_1.default.getPatientInfo);
router.get('/healthworker/patient/prescription', authMiddleware_1.default.authenticate('jwt', { session: false }), adminController_1.default.getPatientPrescriptions);
router.get('/healthworker/patient/singleprescription', authMiddleware_1.default.authenticate('jwt', { session: false }), adminController_1.default.getSinglePrescription);
router.post('/healthworker/patient/prescription', authMiddleware_1.default.authenticate('jwt', { session: false }), adminController_1.default.addPrescription);
router.get('/healthworker/dashboardStatistics', authMiddleware_1.default.authenticate('jwt', { session: false }), adminController_1.default.dashBoardStatistics);
router.patch('/healthworker/patient/medication', authMiddleware_1.default.authenticate('jwt', { session: false }), adminController_1.default.addMedication);
router.get('/healthworker/patient/vitals', authMiddleware_1.default.authenticate('jwt', { session: false }), adminController_1.default.getPatientVitals);
exports.default = router;
