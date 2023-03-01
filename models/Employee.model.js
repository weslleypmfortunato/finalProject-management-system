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
  phoneNumber: String,
  level: {
    type: String,
    default: 'user'
  },
  startingDate: String,
  department: {
    type: String,
    enum: ["generic", "production", "molding", "packing", "flowwrap", "warehouse"]
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
    default: 'https://res.cloudinary.com/weslley-m-fortunato/image/upload/v1677395919/rogers_images/xjqfsyhzb3p2khw8kkwa.png'
  }
}, {timestamps: true})

export default model ('Employee', employeeSchema)