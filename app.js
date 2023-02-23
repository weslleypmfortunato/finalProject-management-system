import "dotenv/config"
import cors from 'cors'
import express from "express"
import connectDB from "./config/db.connection.js"
import authRouter from "./routes/auth.routes.js"
import employeesListRouter from "./routes/employeesList.routes.js"

const app = express()
connectDB()

app.use(cors())
app.use(express.json())

app.use(authRouter)
app.use(employeesListRouter)

app.get('/test', (req, res) => {
  res.send('API working properly!')
})

app.listen(process.env.PORT || 3001, ()=> console.log('Server listening on port: ', process.env.PORT || 3001))