import { Patient, Prescription } from '../Model/database'
import 'dotenv/config'
export const updatePrescriptions = async () => {
  // const currentDate = new Date()
  Prescription.updateMany(
    {
      $or: [
        { 'drugs.end_date': { $gte: new Date() } },
        { drugs: { $exists: false } },
      ],
    },
    {
      $set: { active: true },
    }
  )
    .then(result => {
      console.log(`${result.modifiedCount} documents updated.`)
    })
    .catch(error => {
      console.error('Error updating documents:', error)
    })

  Prescription.updateMany(
    {
      $or: [
        { 'drugs.end_date': { $lt: new Date() } },
        { drugs: { $exists: false } },
      ],
    },
    {
      $set: { active: false },
    }
  )
    .then(result => {
      console.log(`${result.modifiedCount} documents updated.`)
    })
    .catch(error => {
      console.error('Error updating documents:', error)
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
            drugNoun = 'mg'
          } else if (drug.type.toLowerCase() === 'syrup') {
            drugNoun = 'ml'
          } else if (drug.type.toLowerCase() === 'inhaler') {
            drugNoun = 'puffs'
          } else if (drug.type.toLowerCase() === 'tablet') {
            drugNoun = 'tablets'
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
      console.log(text)
      sendSMS(to, text)
    }
  })
}

export async function sendSMS(to: string, text: string) {
  const url = 'https://my.kudisms.net/api/sms'
  const token = process.env.KUDI_SMS_TOKEN as string
  const senderID = process.env.KUDI_SMS_SENDER_ID as string
  const recipients = to
  const message = text
  const gateway = '2'
  const queryParams = new URLSearchParams({
    token,
    senderID,
    recipients,
    message,
    gateway,
  })

  fetch(`${url}?${queryParams}`, { method: 'GET' })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then(data => {
      console.log('Sent message sucesfully')
      console.log('Response:', data)
    })
    .catch(error => {
      console.log('An error occured while sending message')
      console.error('Error:', error.message)
    })
}
