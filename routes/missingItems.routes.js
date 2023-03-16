import { Router } from "express";
import isAuthenticatedMiddleware from "../middlewares/isAuthenticatedMiddleware.js";
import Products from '../models/Products.model.js'
import WorkOrder from '../models/WorkOrder.model.js.js'

const missingItemsRouter = Router()

missingItemsRouter.post('/missing-products', isAuthenticatedMiddleware, async (req, res) => {
  const { productCode, quantities } = req.body
  try {
    const product = await Products.findOne({productCode})

    if (!product) {
      return res.status(404).json({message: "Product not found!"})
    }
    const workOrder = new WorkOrder({ product: product._id, quantities })
    await workOrder.save()
    res.status(201).json({message: "Missing list created succesfully"})
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal server error"})
  }
})

missingItemsRouter.get('/missing-products', isAuthenticatedMiddleware, async (req, res) => {
  try {
    const totalQtyPerItem = await WorkOrder.aggregate([
      {
        $group: {
          _id: '$product',
          totalQuantity: { 
            $sum: '$quantities'
          }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                $first: '$product'
              },
              '$$ROOT'
            ]
          }
        }
      },
      {
        $unwind: '$product',
      },
      {
        $project: {
          _id: 0,
          productCode: '$product.productCode',
          productDescription: '$product.productDescription',
          totalQuantity: 1,
        }
      }
    ])

    console.log("AQUI ==> ", totalQtyPerItem)
    return res.status(200).json(totalQtyPerItem)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: 'Internal server error'})
  }
}) 

// missingItemsRouter.get('/missing-products', isAuthenticatedMiddleware, async (req, res) => {
//   try {
//     const catchMissinItems = await WorkOrder.find().populate('product', 'productCode productDescription')
//     console.log("AQUI ==> ", catchMissinItems)
//     return res.status(200).json(catchMissinItems)
//   } catch (error) {
//     console.log(error)
//     return res.status(500).json({message: "Internal server error"})
//   }
// })

export default missingItemsRouter