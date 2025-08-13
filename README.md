# 📱 WhatsApp Web Clone – Full Stack Developer Evaluation Task

A WhatsApp Web–like chat interface that displays real-time conversation data from webhook payloads, with the ability to send demo messages (stored in MongoDB).  
Built as part of the **Full Stack Developer Evaluation Task**.

### Live demo url 
https://whatsapp-web-clone-1.onrender.com/
---

## 🚀 Features

- **Webhook Payload Processor**
  - Reads sample payloads from JSON files (provided in task ZIP)
  - Inserts new messages into MongoDB (`whatsapp.processed_messages`)
  - Updates message statuses (sent, delivered, read) based on status payloads

- **WhatsApp Web–Like UI**
  - Displays all conversations grouped by user (`wa_id`)
  - Click on a chat to view:
    - All message bubbles with date/time
    - Message status indicators
    - Basic user info (name, number)
  - Fully responsive – works on desktop and mobile

- **Send Message (Demo)**
  - Input box like WhatsApp Web
  - Adds message to the UI and saves it to MongoDB
  - **No actual WhatsApp message sending** – for demo only

- **Deployment**
  - Hosted publicly using Render (backend) and Vercel (frontend)
  - Accessible without any setup

---

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Tailwind CSS
- Axios

**Backend:**
- Node.js (Express)
- MongoDB Atlas
- Mongoose
- Socket.IO (optional for real-time)

**Tools:**
- Nodemon (development)
- dotenv (environment variables)

---

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

https://github.com/Swati-jain123/whatsapp_web_clone.git
cd whatsapp-web-clone 

### 2️⃣ Backend Setup

cd server
npm install


### Create a .env file:
MONGO_URI=your_mongodb_atlas_connection_string
PORT=4000

### Put payload data on mongodb atlas 
npm run process-payloads

### Start the backend:

npm start

### 3️⃣ Frontend Setup
cd frontend
npm install

## Start the Frontend
npm start


