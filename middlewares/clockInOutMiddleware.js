import 'dotenv/config'
import bcrypt from 'bcryptjs'
import User from '../models/User.model.js'

const clockInOutMiddleware = async (req, res, next) => {

  const {employeeCode, password} = req.body

  try {
    const user = await User.findOne({ employeeCode })

    if (!user) {
      throw new Error('Employee Code does not exist.')
    }

    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({message: "Invalid Password."})
    }

    req.user = user
    
    next()
  } catch (error) {
    console.log(error)
    return res.status(401).json({message: "Unauthorized - 2"})
  }
}

export default clockInOutMiddleware