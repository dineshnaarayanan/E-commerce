import mongoose from 'mongoose';
import { JSONModel } from './fallback.js';

const bankTransactionSchema = new mongoose.Schema({
  utrNumber: { type: String, required: true, unique: true },
  senderName: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  isReconciled: { type: Boolean, required: true, default: false }
}, { timestamps: true });

const MongooseBankTransaction = mongoose.model('BankTransaction', bankTransactionSchema);
const jsonBankTransaction = new JSONModel('BankTransaction');

const BankTransaction = {
  find: (query) => global.useJSONDb ? jsonBankTransaction.find(query) : MongooseBankTransaction.find(query),
  findOne: (query) => global.useJSONDb ? jsonBankTransaction.findOne(query) : MongooseBankTransaction.findOne(query),
  countDocuments: () => global.useJSONDb ? jsonBankTransaction.countDocuments() : MongooseBankTransaction.countDocuments(),
  insertMany: (items) => global.useJSONDb ? jsonBankTransaction.insertMany(items) : MongooseBankTransaction.insertMany(items),
  create: (item) => global.useJSONDb ? jsonBankTransaction.create(item) : MongooseBankTransaction.create(item),
  findOneAndDelete: (query) => global.useJSONDb ? jsonBankTransaction.findOneAndDelete(query) : MongooseBankTransaction.findOneAndDelete(query)
};

export default BankTransaction;
