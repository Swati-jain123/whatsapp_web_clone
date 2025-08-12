
import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';

const mongoUrl = 'mongodb+srv://swati2003jain:kymhuFMF0nKIzoNs@cluster0.bua8ufs.mongodb.net/whatsapp?retryWrites=true&w=majority';
const dbName = 'whatsapp';
const collectionName = 'processed_messages';
const payloadsDir = './payloads';

async function connectDB() {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    return client;
}

function extractMessageData(payload) {
    try {
        const entry = payload?.metaData?.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;

        const contact = value?.contacts?.[0];
        const message = value?.messages?.[0];

        return {
            wa_id: contact?.wa_id || null,
            name: contact?.profile?.name || 'Unknown',
            from: message?.from || null,
            message: message?.text?.body || '',
            timestamp: message?.timestamp
                ? new Date(parseInt(message.timestamp) * 1000)
                : null,
            status: payload?.status || 'sent',
            messageId: message?.id || null
        };
    } catch (err) {
        console.error('❌ Error extracting message data:', err);
        return null;
    }
}

async function processPayloads() {
    const client = await connectDB();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const files = fs.readdirSync(payloadsDir).filter(file => file.endsWith('.json'));
    console.log(`📂 Found ${files.length} files in ${payloadsDir}`);

    for (const file of files) {
        const filePath = path.join(payloadsDir, file);
        let jsonData;
        try {
            jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (err) {
            console.error(`❌ Error parsing JSON in ${file}:`, err);
            continue;
        }

        const lowerName = file.toLowerCase();

        if (lowerName.includes('message')) {
            const messageDoc = extractMessageData(jsonData);
            if (!messageDoc?.messageId) {
                console.warn(`⚠️ Skipping ${file}, no messageId`);
                continue;
            }

            await collection.updateOne(
                { messageId: messageDoc.messageId },
                { $set: { ...messageDoc, updatedAt: new Date() } },
                { upsert: true }
            );

            console.log(`💾 Saved message for ${messageDoc.name} (${messageDoc.wa_id})`);

        } else if (lowerName.includes('status')) {
            const statusObj = jsonData?.metaData?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0];
            if (!statusObj?.id) {
                console.warn(`⚠️ Skipping ${file}, no status ID`);
                continue;
            }

            await collection.updateOne(
                { messageId: statusObj.id },
                { $set: { status: statusObj.status || 'unknown', updatedAt: new Date() } }
            );

            console.log(`🔄 Updated status for ${statusObj.id} → ${statusObj.status}`);
        }
    }

    console.log('✅ Processing complete.');
    await client.close();
}

processPayloads().catch(err => {
    console.error('❌ Error processing payloads:', err);
});
