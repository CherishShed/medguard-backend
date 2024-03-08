import { Request, Response } from 'express'
import { Patient, Prescription } from '../Model/database'
import vonage from '../Middlewares/smsMiddleware'

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
    const { hospitalNumber, blood_pressure, heart_beat, blood_oxygen } =
      req.query
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
          status: 1,
          latestVitals: 1,
        }
      )
      if (foundPatient) {
        foundPatient.vitals.push({
          blood_oxygen: parseInt(blood_oxygen as string),
          blood_pressure: blood_pressure as string,
          heart_beat: parseInt(heart_beat as string),
        })
        foundPatient.latestVitals = {
          blood_oxygen: parseInt(blood_oxygen as string),
          blood_pressure: blood_pressure as string,
          heart_beat: parseInt(heart_beat as string),
        }
        const [systolic, diastolic] = (blood_pressure as string)
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
        if (
          parseInt(heart_beat as string) < 60 ||
          parseInt(heart_beat as string) > 100
        ) {
          // Abnormal heart rate
          status = 'bad'
        } else if (
          parseInt(heart_beat as string) < 70 ||
          parseInt(heart_beat as string) > 90
        ) {
          // Warning for heart rate
          if (status !== 'bad') {
            status = 'abnormal'
          }
        }
        foundPatient.status = status
        foundPatient.save()
        const from = process.env.VONAGE_VIRTUAL_NUMBER as string
        const to = foundPatient.phone_number
        const text = `Dear ${foundPatient.firstName}, your Vitals do not look good please visit the hospital as soon as possible.\nBlood pressure: ${blood_pressure}mmHg\nHeartbeat: ${heart_beat}bpm\n`
        async function sendSMS() {
          await vonage.sms
            .send({ to, from, text, title: 'Medguard' })
            .then(resp => {
              console.log('Message sent successfully')
              console.log(resp)
            })
            .catch(err => {
              console.log('There was an error sending the messages.')
              console.error(err)
            })
        }
        if (status === 'bad' || 'abnormal') {
          sendSMS()
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
