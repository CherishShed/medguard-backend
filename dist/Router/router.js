"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const patientController_1 = __importDefault(require("../Controllers/patientController"));
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Good' });
});
router.get('/patient', patientController_1.default.getPatientInfo);
router.post('/patient/vitals', patientController_1.default.addVitals);
exports.default = router;
