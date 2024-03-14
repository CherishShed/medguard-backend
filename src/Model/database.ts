import mongoose, { Document, ObjectId } from 'mongoose'
import 'dotenv/config'
import cron from 'node-cron'
import {
  updatePrescriptions,
  medicationReminder,
} from '../Utils/helperFunctions'

mongoose.set('strictQuery', true)
export const connectToDatabase = async () => {
  mongoose
    .connect(process.env.CONNECTION_STRING! as string, {
      dbName: 'MedGuard',
    })
    .then(() => {
      console.log('Database Connection Succeeded')
      cron.schedule('45 11 * * *', () => {
        console.log('Running job...')
        updatePrescriptions()
      })
      cron.schedule('47 11 * * *', () => {
        console.log('Running medicationReminder...')
        medicationReminder()
      })
    })
    .catch(err => {
      console.log(`An error occurred connecting to database: ${err}`)
    })
}
mongoose.connection.on('error', err => {
  console.log(
    `An error occurred connecting to database: ${err},\n...reconnecting`
  )
  connectToDatabase()
})
export interface patientType extends Document {
  hospitalNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  bloodgroup: string
  genotype: string
  status: string
  phone_number: string
  emergencyContact1: string
  emergencyContact2: string
  prescriptions: Array<IMedication[]>
  vitals: IVital[]
  latestVitals: IVital
  lastUpdatedBy: ObjectId
}
interface IVital {
  blood_pressure: string
  heart_beat: number
  blood_oxygen: number
}
interface IMedication {
  name: string
  instructions: string
  morning: { amount: number; time: string }
  afternoon: { amount: number; time: string }
  night: { amount: number; time: string }
  type: string
  start_date: string
  end_date: string
}
export interface EmployeeType extends Document {
  employeeNumber: string
  password: string
  firstName: string
  lastName: string
  dateOfBirth: string
  phoneNumber: string
  gender: string
  post: string
  changedPassword: boolean
  patientUnderCare: string[]
}
export interface PrescriptionType extends Document {
  prescriptionDate: string
  drugs: IMedication[]
  patient: string
  active: boolean
  lastUpdatedBy: ObjectId
}
const employeeSchema = new mongoose.Schema<EmployeeType>({
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
  ],
})

const medicationSchema = new mongoose.Schema<IMedication>({
  name: { type: String },
  instructions: { type: String },
  morning: { type: { amount: Number, time: String } },
  afternoon: { type: { amount: Number, time: String } },
  night: { type: { amount: Number, time: String } },
  type: { type: String },
  start_date: { type: String },
  end_date: { type: String },
})

const prescriptionSchema = new mongoose.Schema<PrescriptionType>(
  {
    prescriptionDate: { type: String },
    drugs: [medicationSchema],
    patient: {
      type: String,
      ref: 'Patient',
    },
    active: { type: Boolean, default: true },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthWorker',
    },
  },
  { timestamps: true }
)
const vitalSchema = new mongoose.Schema<IVital>(
  {
    blood_pressure: { type: String },
    heart_beat: { type: Number },
    blood_oxygen: { type: Number },
  },
  { timestamps: true }
)
const patientSchema = new mongoose.Schema<patientType>(
  {
    hospitalNumber: { type: String, required: true, unique: true },
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
    vitals: [vitalSchema],
    latestVitals: vitalSchema,
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthWorker',
    },
  },

  { timestamps: true }
)

export const Patient = mongoose.model<patientType>('Patient', patientSchema)
export const HealthWorker = mongoose.model<EmployeeType>(
  'HealthWorker',
  employeeSchema
)
export const Prescription = mongoose.model<PrescriptionType>(
  'Prescription',
  prescriptionSchema
)
