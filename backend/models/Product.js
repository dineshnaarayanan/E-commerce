import mongoose from 'mongoose';
import { JSONModel } from './fallback.js';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  stock: { type: Number, required: true, default: 0 },
  status: { type: String, required: true, enum: ['Active', 'Draft'], default: 'Active' },
  image: { type: String, required: true },
  description: { type: String, required: true }
}, { timestamps: true });

const MongooseProduct = mongoose.model('Product', productSchema);
const jsonProduct = new JSONModel('Product');

const Product = {
  find: (query) => global.useJSONDb ? jsonProduct.find(query) : MongooseProduct.find(query),
  findOne: (query) => global.useJSONDb ? jsonProduct.findOne(query) : MongooseProduct.findOne(query),
  countDocuments: () => global.useJSONDb ? jsonProduct.countDocuments() : MongooseProduct.countDocuments(),
  insertMany: (items) => global.useJSONDb ? jsonProduct.insertMany(items) : MongooseProduct.insertMany(items),
  create: (item) => global.useJSONDb ? jsonProduct.create(item) : MongooseProduct.create(item),
  findOneAndDelete: (query) => global.useJSONDb ? jsonProduct.findOneAndDelete(query) : MongooseProduct.findOneAndDelete(query)
};

export default Product;
