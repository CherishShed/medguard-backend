import { Request, Response } from 'express'
import { Patient } from '../Model/database'

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
      const foundPatient = await Patient.findOne({
        hospitalNumber: hospitalNumber,
      })
      if (foundPatient) {
        foundPatient.vitals.push({
          blood_oxygen: parseInt(blood_oxygen as string),
          blood_pressure: parseInt(blood_pressure as string),
          heart_beat: parseInt(heart_beat as string),
        })
        foundPatient.save()
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
      const foundPatient = await Patient.findOne(
        {
          hospitalNumber: hospitalNumber,
        },
        { medications: 1 }
      )
      if (foundPatient) {
        return res
          .status(200)
          .json({ medication: foundPatient.medications, message: 'Success' })
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
