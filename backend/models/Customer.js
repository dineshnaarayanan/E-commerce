import mongoose from 'mongoose';
import { JSONModel } from './fallback.js';

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  password: { type: String, default: '' },
  orderCount: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 }
}, { timestamps: true });

const MongooseCustomer = mongoose.model('Customer', customerSchema);
const jsonCustomer = new JSONModel('Customer');

const Customer = {
  find: (query) => global.useJSONDb ? jsonCustomer.find(query) : MongooseCustomer.find(query),
  findOne: (query) => global.useJSONDb ? jsonCustomer.findOne(query) : MongooseCustomer.findOne(query),
  countDocuments: () => global.useJSONDb ? jsonCustomer.countDocuments() : MongooseCustomer.countDocuments(),
  insertMany: (items) => global.useJSONDb ? jsonCustomer.insertMany(items) : MongooseCustomer.insertMany(items),
  create: (item) => global.useJSONDb ? jsonCustomer.create(item) : MongooseCustomer.create(item),
  findOneAndDelete: (query) => global.useJSONDb ? jsonCustomer.findOneAndDelete(query) : MongooseCustomer.findOneAndDelete(query)
};

export default Customer;
