import jwt from 'jsonwebtoken'
import 'dotenv/config'

const getTokemFronHeaders = req => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    console.log(req.headers.authorization)
    return req.headers.authorization.split(' ')[1]
  }
  return null
}

const isAuthenticatedMiddleware = (req, res, next) => {
  const token = getTokemFronHeaders(req)

  if (!token) {
    return res.status(401).json({message: "Unauthorized -1 "})
  }

  try {
    const secret = process.env.JWT_SECRET
    const decodedToken = jwt.verify(token, secret)
    req.user = decodedToken
    next()
  } catch (error) {
    return res.status(401).json({message: "Unauthorized - 2"})
  }
}

export default isAuthenticatedMiddleware