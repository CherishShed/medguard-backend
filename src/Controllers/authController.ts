import { Request, Response } from 'express'
import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { HealthWorker } from '../Model/database'
type userType = {
  employeeNumber: string
  firstName: string
  lastName: string
  gender: string
  dateOfBirth: string
  phoneNumber: string
  changedPassword: string
  post: string
}
const authController = {
  isLoggedIn: async (req: Request, res: Response) => {
    if (req.user) {
      const user = (req.user as userType[])[0]
      return res.status(200).json({
        auth: true,
        user: {
          employeeNumber: user.employeeNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          phoneNumber: user.phoneNumber,
          changedPassword: user.changedPassword,
          post: user.post,
        },
      })
    } else {
      return res.status(401).json({ auth: false })
    }
  },
  loginUser: async (req: Request, res: Response) => {
    const { username, password } = req.body

    try {
      const user = await HealthWorker.findOne({
        employeeNumber: (username as string).toUpperCase(),
      })
      if (!user) {
        res
          .status(404)
          .json({ auth: false, message: 'User not found', user: null })
        return
      }
      const match = await compare(password, user.password)
      if (!match) {
        res
          .status(401)
          .json({ auth: false, message: 'Incorrrect Password', user: null })
        return
      }
      const accessToken = jwt.sign(
        {
          employeeNumber: user.employeeNumber,
          first_name: user.firstName,
          last_name: user.lastName,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: '3h' }
      )
      res.status(200).json({
        auth: true,
        message: 'Login successful',
        user: {
          employeeNumber: user.employeeNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          phoneNumber: user.phoneNumber,
          changedPassword: user.changedPassword,
        },
        accessToken,
      })
      return
    } catch (error) {
      if (error) {
        res
          .status(500)
          .json({ error: error, message: 'Error authenticating user' })
        return
      }
    }
  },
  changePassword: async (req: Request, res: Response) => {
    const { employeeNumber, newPassword, oldPassword } = req.body
    const hashedPassword = await hash(newPassword, 10)

    try {
      const existingUser = await HealthWorker.findOne(
        {
          employeeNumber: employeeNumber,
        },
        { employeeNumber: 1, changedPassword: 1, password: 1 }
      )
      if (existingUser) {
        const match = await compare(oldPassword, existingUser!.password)
        if (!match) {
          return res
            .status(401)
            .json({ auth: false, message: 'Incorrrect Password', user: null })
        }
        existingUser.password = hashedPassword
        existingUser.changedPassword = true
        existingUser.save()
        return res.status(200).json({ success: true })
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'user not found' })
      }
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: 'An error occured' })
    }
  },
  logout: async (req: Request, res: Response) => {
    req.logout(err => {
      if (err) {
        return res
          .status(500)
          .json({ error: err, success: false, message: 'An error occured' })
      }
      return res.status(200).json({ success: true })
    })
  },
}

export default authController
