import mongoose from 'mongoose';
import { JSONModel } from './fallback.js';

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
}, { timestamps: true });

const MongooseAdmin = mongoose.model('Admin', adminSchema);
const jsonAdmin = new JSONModel('Admin');

const Admin = {
  find: (query) => global.useJSONDb ? jsonAdmin.find(query) : MongooseAdmin.find(query),
  findOne: (query) => global.useJSONDb ? jsonAdmin.findOne(query) : MongooseAdmin.findOne(query),
  countDocuments: () => global.useJSONDb ? jsonAdmin.countDocuments() : MongooseAdmin.countDocuments(),
  insertMany: (items) => global.useJSONDb ? jsonAdmin.insertMany(items) : MongooseAdmin.insertMany(items),
  create: (item) => global.useJSONDb ? jsonAdmin.create(item) : MongooseAdmin.create(item),
  findOneAndDelete: (query) => global.useJSONDb ? jsonAdmin.findOneAndDelete(query) : MongooseAdmin.findOneAndDelete(query)
};

export default Admin;
