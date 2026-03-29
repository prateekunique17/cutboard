# 🚀 Getting Started with CutBoard AI

Welcome! Follow these simple steps to get your professional Creative Audit workspace running on your local machine.

---

## 🛠️ Step 1: Prerequisites
Before starting, ensure you have the following installed:
1. **Node.js** (v18 or higher)
2. **FFmpeg**: This is required for video processing (Thumbnails & Durations).
   - **Windows**: Install via `winget install ffmpeg` or download from ffmpeg.org.
   - **Mac**: Install via `brew install ffmpeg`.

---

## 🔐 Step 2: Environment Setup
You need a `.env` file in the **server** folder.
1. Navigate to `server/`
2. Create a file named `.env`
3. Paste the following (Replace with your actual keys):
```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🏗️ Step 3: Launch the Backend
Open a **new terminal** and run these commands:
```bash
cd server
npm install
node src/server.js
```
> [!TIP]
> You should see: `Server running on port 5000`

---

## 🎨 Step 4: Launch the Frontend
Open a **second terminal** and run these commands:
```bash
cd client
npm install
npm run dev
```
> [!TIP]
> You should see a link: `http://localhost:5173`

---

## 🚥 Summary of Ports
- **Frontend**: http://localhost:5173 🌐
- **Backend**: http://localhost:5000 ⚙️
- **Database**: Managed by Supabase ☁️

---

### 💪 Pro Troubleshooting
- **Video not uploading?** Ensure your Supabase Storage bucket is named `videos` and set to **Public**.
- **AI Scan failing?** Check that your `GEMINI_API_KEY` is active and has access to the Gemini 1.5 models.

**Happy Editing! 🎬🔥✨**
