import { Router } from "express";
import Employee from '../models/Employee.model.js'
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import fileUpload from '../config/cloudinary.config.js'

const employeesListRouter = Router()

employeesListRouter.get('/employee', async (req, res) => {

  try {
    const employeesList = await Employee.find({currentStatus: false}).sort({name: 1}).select({passwordHash: 0})
    return res.status(200).json(employeesList)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal Server Error"})
  }
})

employeesListRouter.get('/former-employee', async (req, res) => {
  try {
    const formerEmployeeList = await Employee.find({currentStatus: true}).sort({name: 1}).select({passwordHash: 0})
    return res.status(200).json(formerEmployeeList)
  }catch(error) {
    console.log(error)
    return res.status(500).json({message: "Internal Server Error"})
  }
})

employeesListRouter.post('/sign-up/employee', async (req, res) => {

  const { name, employeeCode, dob, phoneNumber, level, startingDate, department, position, password, emergencyContact, currentStatus, comments, imageUrl } = req.body

  try {
    const userExists = await Employee.findOne({employeeCode})
    if (userExists) {
      throw new Error('Employee code already in use')
    }
    const salt = bcrypt.genSaltSync(+process.env.SALT_ROUNDS)
    const passwordHash = bcrypt.hashSync(password, salt)

    const newEmployee = await Employee.create({ name, employeeCode, dob, phoneNumber, level, startingDate, department, position, passwordHash, emergencyContact, currentStatus, comments, imageUrl })
    if (newEmployee) {
      return res.status(201).json({message: "Employee create successfully"})
    }
  } catch (error) {
    console.log(error)

    if (error.message === 'Employee code already in use') {
      return res.status(409).json({message: "Check inputted data"})
    }
    return res.status(500).json({message: "Internal Server Error"})
  }
})

employeesListRouter.get('/employee/:id', async (req, res) => {

  try {
    const { id } = req.params
    const employeeId = await Employee.findById(id).select({passwordHash: 0})

    if (!employeeId) {
      return res.status(404).json({message: "Employee not found!"})
    }
    return res.status(200).json(employeeId)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal Server Error - 3"})
  }
})

employeesListRouter.put('/employee/edit/:id', async (req, res) => {

  try {
    const payload = req.body
    const { id } = req.params

    const updateEmployee = await Employee.findByIdAndUpdate({_id: id}, payload, { new: true })
    return res.status(200).json(updateEmployee)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal Server Error - 4"})
  }
})

employeesListRouter.post('/employee/file-upload', fileUpload.single('rogers_images'), (req, res) => {
  return res.status(201).json({url: req.file.path})
})

export default employeesListRouter

