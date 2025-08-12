
// server/lib/processor.js
const ProcessedMessage = require('../models/ProcessedMessage');

function epochToDate(ts) {
  const n = Number(ts);
  if (!n || isNaN(n)) return new Date();
  if (n > 1e12) return new Date(n); // ms
  return new Date(n * 1000); // seconds -> ms
}

async function processWebhookPayload(payload, io = null) {
  const inserted = [];
  const entries = payload.metaData?.entry || payload.entry || [];

  for (const e of entries) {
    const changes = e.changes || [];
    for (const c of changes) {
      const value = c.value || c;

      // contacts -> wa_id and profile name
      const contacts = value.contacts || [];
      const contact = contacts[0] || {};
      const wa_id = contact.wa_id || (value.messages && value.messages[0] && value.messages[0].from);

      // messages array (inbound/outbound)
      const messages = value.messages || [];
      for (const m of messages) {
        const msgId = m.id || m.message_id || m.mid || m.msg_id;
        const text = m.text?.body || m.message?.text?.body || (m.caption?.body) || null;
        const timestamp = epochToDate(m.timestamp || m.ts || payload.createdAt || Date.now()/1000);

        const doc = {
          wa_id: wa_id || m.from || m.to || null,
          from: m.from || null,
          to: m.to || null,
          msg_id: msgId || `local-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
          meta_msg_id: m.meta_msg_id || null,
          type: m.type || 'text',
          text,
          timestamp,
          status: 'sent',
          direction: (m.from === process.env.BUSINESS_NUMBER) ? 'outbound' : 'inbound',
          raw: m
        };

        try {
          const upserted = await ProcessedMessage.findOneAndUpdate(
            { msg_id: doc.msg_id },
            { $setOnInsert: doc },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          inserted.push(upserted);
          if (io) io.emit('new_message', upserted);
        } catch (err) {
          console.error('processor: insert error', err.message);
        }
      }

      // statuses array (status updates referencing message id or meta_msg_id)
      const statuses = value.statuses || value.status || [];
      for (const st of statuses) {
        const idOrMeta = st.id || st.message_id || st.meta_msg_id || st.msg_id;
        const newStatus = st.status || st.state;
        if (!idOrMeta || !newStatus) continue;
        const found = await ProcessedMessage.findOneAndUpdate(
          { $or: [{ msg_id: idOrMeta }, { meta_msg_id: idOrMeta }] },
          { $set: { status: newStatus } },
          { new: true }
        );
        if (found) {
          if (io) io.emit('status_update', { msg_id: found.msg_id, status: found.status });
        }
      }
    }
  }

  return inserted;
}

module.exports = { processWebhookPayload };
