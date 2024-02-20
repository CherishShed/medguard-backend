import 'dotenv/config'
import passport from 'passport'
import { HealthWorker } from '../Model/database'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET as string,
    },
    async (jwtPayload, done) => {
      try {
        const user = await HealthWorker.find({
          employeeNumber: jwtPayload.employeeNumber,
        })

        if (user) {
          return done(null, user)
        } else {
          return done(null, false)
        }
      } catch (error) {
        return done(error, false)
      }
    }
  )
)

export default passport
