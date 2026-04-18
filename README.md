# AI Video clipper🚀

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
