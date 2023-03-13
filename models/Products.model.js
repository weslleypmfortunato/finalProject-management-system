import mongoose from "mongoose";

const { Schema, model } = mongoose 

const productsSchema = new Schema ({
  productCode: {
    type: String,
    required: true
  },
  productDescription: {
    type: String,
    required: true
  }
}, {timestamps: true})

export default model ('Products', productsSchema)