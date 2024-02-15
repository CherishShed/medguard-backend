import mongoose, { Date, Document } from 'mongoose'
import 'dotenv/config'
mongoose.set('strictQuery', true)
console.log(process.env.CONNECTION_STRING)
export const connectToDatabase = async () => {
  mongoose
    .connect(process.env.CONNECTION_STRING! as string, {
      dbName: 'MedGuard',
    })
    .then(() => {
      console.log('Database Connection Succeeded')
    })
    .catch(err => {
      console.log(`An error occurred connecting to database: ${err}`)
    })
}
mongoose.connection.on('error', err => {
  console.log(
    `An error occurred connecting to database: ${err},\n...reconnecting`
  )
  mongoose
    .connect(process.env.CONNECTION_STRING! as string, {
      dbName: 'MedGuard',
    })
    .then(() => {
      console.log('Database Connection Succeeded')
    })
    .catch(err => {
      console.log(`An error occurred connecting to database ${err}`)
    })
})

export interface patientType extends Document {
  hospitalNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  bloodgroup: string
  genotype: string
  phone_number: string
  emergencyContact1: string
  emergencyContact2: string
  medications: IMedication[]
  vitals: IVital[]
}
interface IVital extends Document {
  blood_pressure: number
  heart_beat: number
  blood_oxygen: number
}
interface IMedication extends Document {
  name: string
  instructions: string
  morning: { amount: number; time: string }
  afternoon: { amount: number; time: string }
  night: { amount: number; time: string }
  type: string
  start_date: Date
  end_date: Date
}

const medicationSchema = new mongoose.Schema<IMedication>(
  {
    name: { type: String },
    instructions: { type: String },
    morning: { type: { amount: Number, time: String } },
    afternoon: { type: { amount: Number, time: String } },
    night: { type: { amount: Number, time: String } },
    type: { type: String },
    start_date: { type: String, default: Date.now().toString() },
    end_date: { type: String, default: Date.now().toString() },
  },
  { timestamps: true }
)

const vitalSchema = new mongoose.Schema<IVital>(
  {
    blood_pressure: { type: Number },
    heart_beat: { type: Number },
    blood_oxygen: { type: Number },
  },
  { timestamps: true }
)
const userSchema = new mongoose.Schema<patientType>(
  {
    hospitalNumber: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    gender: { type: String, required: true },
    bloodgroup: { type: String, required: true },
    genotype: { type: String, required: true },
    phone_number: { type: String, required: true },
    emergencyContact1: { type: String },
    emergencyContact2: { type: String },
    medications: [medicationSchema],
    vitals: [vitalSchema],
  },
  { timestamps: true }
)

export const Patient = mongoose.model<patientType>('Patient', userSchema)
