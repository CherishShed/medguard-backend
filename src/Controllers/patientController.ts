import { Request, Response } from 'express'
import { Patient, Prescription } from '../Model/database'
import { sendSMS } from '../Utils/helperFunctions'

const patientController = {
  getPatientInfo: async (req: Request, res: Response) => {
    const { hospitalNumber } = req.query
    try {
      const foundPatient = await Patient.findOne(
        {
          hospitalNumber: hospitalNumber,
        },
        {
          hospitalNumber: 1,
          firstName: 1,
          lastName: 1,
          phone_number: 1,
          gender: 1,
        }
      )
      if (foundPatient) {
        return res
          .status(200)
          .json({ patient: foundPatient, message: 'Found Record' })
      } else {
        return res
          .status(404)
          .json({ patient: null, message: 'Record does not exist' })
      }
    } catch (error) {
      return res.status(500).json({ error: error, message: 'An error occured' })
    }
  },
  addVitals: async (req: Request, res: Response) => {
    const vitals: {
      blood_pressure: string
      heart_beat: string
      blood_oxygen: string
    }[] = req.body
    const { hospitalNumber } = req.query
    try {
      const foundPatient = await Patient.findOne(
        {
          hospitalNumber: hospitalNumber,
        },
        {
          vitals: 1,
          phone_number: 1,
          hospitalNumber: 1,
          firstName: 1,
          lastName: 1,
          status: 1,
          latestVitals: 1,
        }
      )
      const typedVitals = vitals.map(reading => ({
        blood_oxygen: parseInt(reading.blood_oxygen),
        blood_pressure: reading.blood_pressure,
        heart_beat: parseInt(reading.heart_beat),
      }))
      if (foundPatient) {
        foundPatient.vitals.push(...typedVitals)
        foundPatient.latestVitals = typedVitals[typedVitals.length - 1]
        const latestBlood_pressure =
          typedVitals[typedVitals.length - 1].blood_pressure
        const latestHeart_beat = typedVitals[typedVitals.length - 1].heart_beat
        const latestBlood_oxygen =
          typedVitals[typedVitals.length - 1].blood_oxygen
        const [systolic, diastolic] = (latestBlood_pressure as string)
          .split('/')
          .map(Number)
        let status = 'good'
        if (
          systolic < 90 ||
          systolic > 140 ||
          diastolic < 60 ||
          diastolic > 90
        ) {
          // Abnormal blood pressure
          status = 'bad'
        } else if (systolic < 120 || diastolic < 80) {
          // Warning for blood pressure
          status = 'abnormal'
        }

        // Check heart rate
        if (latestHeart_beat < 60 || latestHeart_beat > 100) {
          // Abnormal heart rate
          status = 'bad'
        } else if (latestHeart_beat < 70 || latestHeart_beat > 90) {
          // Warning for heart rate
          if (status !== 'bad') {
            status = 'abnormal'
          }
        }

        if (latestBlood_oxygen < 90) {
          // Abnormal heart rate
          status = 'bad'
        } else if (latestBlood_oxygen < 95) {
          // Warning for heart rate
          if (status !== 'bad') {
            status = 'abnormal'
          }
        }
        foundPatient.status = status
        foundPatient.save()
        const to = foundPatient.phone_number
        const text = `Dear ${foundPatient.firstName}, your Vitals do not look good please visit the hospital as soon as possible.\nBlood pressure: ${latestBlood_pressure}mmHg\nHeartbeat: ${latestHeart_beat}bpm\nBlood Oxygen: ${latestBlood_oxygen}%\n`
        const hospitalText = `Alert!!!\nThe Vitals of this patient does not look good.\nHospital Number: ${foundPatient.hospitalNumber}\nName: ${foundPatient.firstName} ${foundPatient.lastName}.\nBlood pressure: ${latestBlood_pressure}mmHg\nHeartbeat: ${latestHeart_beat}bpm\nBlood Oxygen: ${latestBlood_oxygen}%\n`
        if (status === 'bad' || 'abnormal') {
          sendSMS(to, text)
          setTimeout(() => {
            sendSMS('2348140660980', hospitalText)
          }, 3000)
        }

        return res.status(200).json({ Success: true, message: 'Success' })
      } else {
        return res
          .status(404)
          .json({ patient: null, message: 'Patient does not exist' })
      }
    } catch (error) {
      return res.status(500).json({ error: error, message: 'An error occured' })
    }
  },
  getMedications: async (req: Request, res: Response) => {
    const { hospitalNumber } = req.query
    try {
      const prescriptions = await Prescription.find({
        patient: hospitalNumber,
      })
      if (prescriptions.length > 0) {
        return res.status(200).json({ prescriptions, message: 'Success' })
      } else {
        return res
          .status(404)
          .json({ patient: null, message: 'Patient does not exist' })
      }
    } catch (error) {
      return res.status(500).json({ error: error, message: 'An error occured' })
    }
  },
}
export default patientController
