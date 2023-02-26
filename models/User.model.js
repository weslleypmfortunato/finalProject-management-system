import mongoose from 'mongoose'

const { Schema, model } = mongoose

const userSchema = new Schema({
  name: {
    type: String,
    required: true 
  },
  employeeCode: {
      type: Number,
      required: true,
      unique: true
  },
  level: {
    type: String,
    enum: ["admin", "supervisor", "user"],
    required: true
  },
  department: {
    type: String,
    enum: ["generic", "production", "molding", "packing", "flowwrap", "warehouse"]
  },
  passwordHash: {
    type: String,
    required: true
  },
  comments: String,
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/150'
  }
}, {timestamps: true})

export default model ('User', userSchema)