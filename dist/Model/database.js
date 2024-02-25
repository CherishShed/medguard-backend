"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthWorker = exports.Patient = exports.connectToDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
mongoose_1.default.set('strictQuery', true);
const connectToDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    mongoose_1.default
        .connect(process.env.CONNECTION_STRING, {
        dbName: 'MedGuard',
    })
        .then(() => {
        console.log('Database Connection Succeeded');
    })
        .catch(err => {
        console.log(`An error occurred connecting to database: ${err}`);
    });
});
exports.connectToDatabase = connectToDatabase;
mongoose_1.default.connection.on('error', err => {
    console.log(`An error occurred connecting to database: ${err},\n...reconnecting`);
    mongoose_1.default
        .connect(process.env.CONNECTION_STRING, {
        dbName: 'MedGuard',
    })
        .then(() => {
        console.log('Database Connection Succeeded');
    })
        .catch(err => {
        console.log(`An error occurred connecting to database ${err}`);
    });
});
const employeeSchema = new mongoose_1.default.Schema({
    employeeNumber: { type: String },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    gender: { type: String, required: true },
    post: { type: String },
    changedPassword: { type: Boolean, required: true },
    patientUnderCare: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Patient',
        },
    ],
});
const medicationSchema = new mongoose_1.default.Schema({
    name: { type: String },
    instructions: { type: String },
    morning: { type: { amount: Number, time: String } },
    afternoon: { type: { amount: Number, time: String } },
    night: { type: { amount: Number, time: String } },
    type: { type: String },
    start_date: { type: String, default: Date.now().toString() },
    end_date: { type: String, default: Date.now().toString() },
}, { timestamps: true });
const vitalSchema = new mongoose_1.default.Schema({
    blood_pressure: { type: String },
    heart_beat: { type: Number },
    blood_oxygen: { type: Number },
}, { timestamps: true });
const patientSchema = new mongoose_1.default.Schema({
    hospitalNumber: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    gender: { type: String, required: true },
    bloodgroup: { type: String, required: true },
    genotype: { type: String, required: true },
    status: { type: String, required: true, default: '' },
    phone_number: { type: String, required: true },
    emergencyContact1: { type: String },
    emergencyContact2: { type: String },
    medications: [medicationSchema],
    vitals: [vitalSchema],
    latestVitals: vitalSchema,
    lastUpdatedBy: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'HealthWorker',
        },
    ],
}, { timestamps: true });
exports.Patient = mongoose_1.default.model('Patient', patientSchema);
exports.HealthWorker = mongoose_1.default.model('HealthWorker', employeeSchema);
