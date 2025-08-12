
const mongoose = require('mongoose');

const ProcessedMessageSchema = new mongoose.Schema({
  wa_id: { type: String, index: true },        // contact id (group by this)
  from: String,
  to: String,
  msg_id: { type: String, index: true },       // message id from webhook (wamid...)
  meta_msg_id: String,
  type: String,
  text: String,
  timestamp: { type: Date, index: true },
  status: { type: String, enum: ['sent','delivered','read','unknown'], default: 'unknown' },
  direction: { type: String, enum: ['inbound','outbound','system'], default: 'inbound' },
  raw: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

// Export model bound to collection 'processed_messages'
module.exports = mongoose.model('ProcessedMessage', ProcessedMessageSchema, 'processed_messages');
