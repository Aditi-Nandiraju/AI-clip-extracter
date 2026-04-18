# AI video clipper 🚀

### Automated Content Repurposing Engine for Short-Form Viral Content

---

## 📌 Problem Statement

Modern creators, educators, and mentors generate **long-form video content** such as lectures, podcasts, and workshops. However, today’s audience primarily consumes content in **short, engaging 60-second clips** (Reels, TikTok, Shorts).

Valuable insights often remain buried inside hours of video, making them hard to discover and share.

### Key Challenges:

* Manually finding high-impact or viral moments in long videos
* Converting horizontal (16:9) videos into vertical (9:16) formats while keeping the speaker centered
* Creating timed, engaging captions and hook-based overlays

---

## 💡 Solution: AttentionX

AttentionX is an **AI-powered video repurposing engine** that automatically transforms long-form videos into short, viral-ready clips.

It uses **Computer Vision + NLP + Audio Analysis + GenAI** to:

* 🔥 Detect emotional and high-impact moments in videos
* 🎯 Automatically crop videos to vertical format with speaker tracking
* 📝 Generate dynamic, timed captions with engagement hooks
* ⚡ Convert one long video into multiple short-form viral clips

---

## ✨ Key Features

### 1. 🎯 Emotional Peak Detection

* Audio spike detection (energy, pitch, intensity)
* Sentiment analysis of speech content
* Identifies “viral-worthy” moments automatically

### 2. 📱 Smart Vertical Cropping

* Face detection and tracking (OpenCV / MediaPipe)
* Keeps speaker centered in 9:16 format
* Smooth cropping transitions for mobile-first viewing

### 3. 📝 Dynamic Caption Generator

* Auto-transcription of speech
* Karaoke-style timed captions
* High-contrast text overlays for engagement

### 4. 🚀 Hook Generator (GenAI)

* Creates attention-grabbing titles
* Generates viral-style intros
* Optimized for TikTok, Reels, Shorts

### 5. 🎬 Clip Generation Engine

* Splits long videos into multiple short clips
* Ranks clips based on engagement score
* Exports ready-to-post content

---

## 🏗️ System Architecture

```
Input Video (16:9)
        ↓
Audio + Video Processing Layer
        ↓
Emotional Peak Detection (NLP + Audio Analysis)
        ↓
Scene Segmentation & Scoring
        ↓
Face Tracking (MediaPipe / OpenCV)
        ↓
Smart Cropping Engine (9:16)
        ↓
Caption Generator (Speech-to-Text + GenAI)
        ↓
Final Clip Renderer
        ↓
Export (Reels / TikTok / Shorts)
```

---

## 🧰 Tech Stack

### Backend

* Python
* Flask / FastAPI

### AI / ML

* OpenCV (face tracking)
* MediaPipe (pose & face detection)
* MoviePy (video editing)
* Whisper / Speech-to-Text models
* NLP models (sentiment + summarization)

### Frontend

* Streamlit / React (optional)

### Storage

* Local / Cloud (S3 / Firebase optional)

---

## ⚙️ Workflow

1. User uploads long-form video
2. System extracts audio + frames
3. AI detects emotional peaks & important segments
4. Face tracking ensures speaker stays centered
5. Captions are generated and synced
6. Clips are rendered into vertical format
7. User downloads or shares short clips

---

## 🔗 Deployment (Lovable AI)

This project can be deployed directly using **Lovable AI**, which automates GitHub integration and app publishing.

### ⚙️ How Publishing Works

* Lovable connects your project to a GitHub repository or workspace
* It pushes code automatically during deployment
* Requires proper OAuth permissions for write access

### ❌ Common Issue: "You don’t have permission"

This error occurs when Lovable cannot write to the connected destination.

### 🔧 Fixes

* Go to Lovable → Settings → Integrations → GitHub
* Disconnect GitHub and reconnect
* Ensure you allow **full repository access**
* Verify you are logged into the correct GitHub account
* Make sure you have **write/admin access** to the repo
* Check if the project is under the correct Lovable workspace

### 🚀 Alternative Deployment

If Lovable fails:

* Download code from Lovable
* Push manually to GitHub
* Deploy using Vercel or Netlify

---

## 📥 Installation (Local Setup)

```bash
# Clone repo
git clone https://github.com/your-username/attentionx.git
cd attentionx

# Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt
```

---

## ▶️ Run the App

```bash
streamlit run app.py
```

---

## 📊 Future Improvements

* Real-time clip generation during live streams
* Virality prediction score using ML
* Multi-language subtitle support
* Auto social media posting integration
* Advanced emotion detection using multimodal transformers

---

## 🧠 Impact

AttentionX turns **1 hour of content into 10+ viral clips**, enabling:

* Educators → better reach
* Creators → higher engagement
* Businesses → scalable content marketing

---

## 🏁 Tagline

**“From Hours to Hooks in Seconds.”** 🚀

---

## 👩‍💻 Built for

AttentionX AI Hackathon

