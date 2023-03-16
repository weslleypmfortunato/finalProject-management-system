import Products from '../models/Products.model.js'
import 'dotenv/config'
import isAuthenticatedMiddleware from '../middlewares/isAuthenticatedMiddleware.js'
import { Router } from 'express'

const productRouter = Router()

productRouter.post('/products/new', isAuthenticatedMiddleware, async (req, res) => {
  const { productCode, productDescription } = req.body

  try {
    const productExists = await Products.findOne({ productCode })
    if (productExists) {
      throw new Error('Product code already in use')
    }
    const newProduct = await Products.create({ productCode, productDescription })

    if (newProduct) {
      return res.status(201).json({message: "Product added succesfully"})
    }
  } catch (error) {
    console.log(error)

    if (error.message === "Product code already in use") {
      return res.status(409).json({message: "Product code already in use"})
    }
    return res.status(500).json({message: "Internal Server Error"})
  }
})

productRouter.get('/products', isAuthenticatedMiddleware, async (req, res) => {

  try {
    const productsList = await Products.find().sort({ productCode: 1 })
    return res.status(200).json(productsList)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal Server Error"})
  }
})

productRouter.get('/product/:id', isAuthenticatedMiddleware, async (req, res) => {
  
  try {
    const { id } = req.params
    const productId = await Products.findById(id)

    if (!productId) {
      return res.status(404).json({message: "Product not found!"})
    }
    return res.status(200).json(productId)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal Server Eorror"})
  }
})

productRouter.put('/product/edit/:id', async (req, res) => {

  try {
    const payload = req.body
    const { id } = req.params

    const updateProduct = await Products.findByIdAndUpdate({ _id: id }, payload, { new: true })
    return res.status(200).json(updateProduct)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal Server Error"})
  }
})

export default productRouter