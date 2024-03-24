import axios from 'axios'
import { Patient, Prescription } from '../Model/database'
import 'dotenv/config'
export const updatePrescriptions = async () => {
  // const currentDate = new Date()
  const currentDate = new Date()
  const prescriptions = await Prescription.find()
  prescriptions.map(prescription => {
    const drugs = prescription.drugs
    let active = false
    for (const drug of drugs) {
      const endDate = new Date(drug.end_date)
      const endYear = endDate.getFullYear()
      const endMonth = endDate.getMonth()
      const endDay = endDate.getDate()

      // Extract year, month, and day from the current date
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth()
      const currentDay = currentDate.getDate()
      if (
        endYear > currentYear ||
        (endYear === currentYear && endMonth > currentMonth) ||
        (endYear === currentYear &&
          endMonth >= currentMonth &&
          endDay >= currentDay)
      ) {
        active = true
        break
      }
    }
    prescription.active = active
    prescription.save()
  })
}

export const medicationReminder = async () => {
  const prescriptions = await Prescription.find(
    { active: true },
    { active: 1, patient: 1, drugs: 1 }
  )
  prescriptions.forEach(async prescription => {
    const foundPatient = await Patient.findOne(
      { hospitalNumber: prescription.patient },
      { phone_number: 1, firstName: 1 }
    )
    if (foundPatient) {
      const to = foundPatient.phone_number

      let text = `Dear ${foundPatient.firstName}, these are your drugs for the day.\n`
      prescription.drugs.forEach(drug => {
        if (new Date(drug.end_date) >= new Date()) {
          let drugNoun = 'dose'
          if (drug.type.toLowerCase() === 'injection') {
            drugNoun = 'Mg'
          } else if (drug.type.toLowerCase() === 'syrup') {
            drugNoun = 'Ml'
          } else if (drug.type.toLowerCase() === 'inhaler') {
            drugNoun = 'Puffs'
          } else if (drug.type.toLowerCase() === 'tablet') {
            drugNoun = 'Tablets'
          }
          const morningDrugDetails =
            drug.morning.amount > 0
              ? `${drug.morning.amount} ${drugNoun} of ${drug.name} by ${drug.morning.time}\n`
              : ''
          const afternoonDrugDetails =
            drug.afternoon.amount > 0
              ? `${drug.afternoon.amount} ${drugNoun} of ${drug.name} by ${drug.afternoon.time}\n`
              : ''
          const nightDrugDetails =
            drug.night.amount > 0
              ? `${drug.night.amount} ${drugNoun} of ${drug.name} by ${drug.night.time}\n`
              : ''
          const drugDetails = `${morningDrugDetails}${afternoonDrugDetails}${nightDrugDetails}To be taken ${drug.instructions}\n`
          text += drugDetails
        }
      })
      if (
        text !==
        `Dear ${foundPatient.firstName}, these are your drugs for the day.\n`
      ) {
        sendSMS(to, text)
      }
    }
  })
}

export function sendSMS(to: string, text: string) {
  const token = process.env.KUDI_SMS_TOKEN as string
  const senderID = process.env.KUDI_SMS_SENDER_ID as string
  const recipients = to
  const message = text
  const data = new FormData()
  data.append('token', token)
  data.append('senderID', senderID)
  data.append('recipients', recipients)
  data.append('message', message)

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://my.kudisms.net/api/corporate',
    data: data,
  }

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data))
    })
    .catch(function (error) {
      console.log(error)
    })
}

export function calculateAge(dateOfBirth: string) {
  // Split the date string into year, month, and day components
  const dobParts = dateOfBirth.split('-')
  const dobYear = parseInt(dobParts[0])
  const dobMonth = parseInt(dobParts[1])
  const dobDay = parseInt(dobParts[2])

  // Get the current date
  const currentDate = new Date()

  // Calculate the difference in years
  let age = currentDate.getFullYear() - dobYear

  // Check if the birthday has occurred yet this year
  if (
    currentDate.getMonth() < dobMonth - 1 ||
    (currentDate.getMonth() === dobMonth - 1 && currentDate.getDate() < dobDay)
  ) {
    age--
  }

  return age
}
