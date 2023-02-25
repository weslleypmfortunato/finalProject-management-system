import mongoose from "mongoose";

const { Schema, model } = mongoose

const employeeSchema = new Schema({
  name: {
    type: String,
    required: true 
  },
  employeeCode: {
      type: Number,
      required: true,
      unique: true
  },
  dob: String,
  phoneNumber: Number,
  level: {
    type: String,
    enum: ["admin", "supervisor", "user"],
    required: true
  },
  startingDate: String,
  department: {
    type: String,
    enum: ["generic", "production", "molding", "packing", "floorwrap", "warehouse"]
  },
  position: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  emergencyContact: String,
  currentStatus: {
    type: Boolean,
    default: false
  },
  comments: String,
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/100'
  }
}, {timestamps: true})

export default model ('Employee', employeeSchema)