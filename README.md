# FashAura – Dream Design Studio

FashAura is an AI-powered web application that allows users to imagine, design, and visualize personalized fashion outfits through natural language or voice input.  

# Project Overview

FashAura blends Generative AI with an elegant, user-friendly interface to let anyone become a fashion creator.  
Users can:
- Describe their dream outfits in text or voice
- Customize height, body measurements, and skin tone
- Generate fashion illustrations using Flowise AI + Gemini + Stable Diffusion APIs
- Receive styling suggestions from an AI fashion assistant
- Save, revisit, and download generated designs

This project reimagines how AI can enhance creativity, inclusivity, and personalization in digital fashion.

# Features

- User Authentication — Secure login/signup with Firebase (Email & Google Auth)
- Fashion Studio Controls:
  - Height slider with real-time preview
  - Body measurements input
  - Skin tone slider with live color preview
- Voice-to-Prompt — Describe outfits by speaking (Web Speech API)
- AI Fashion Assistant:
  - Flowise API integration for design generation
  - Secondary Flowise model for styling tips
- Rotating Model & Gallery — View designs on a 3D-like rotating platform with a history strip of generated looks
- One-Click Downloads — Save AI-generated designs instantly
- Customer Reviews — Showcase testimonials with design samples
- Feedback System — Embedded Google Form popup for user feedback

# Tech Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Styling: Custom CSS, Swiper.js, Google Fonts
- Backend & APIs:
  - Flowise AI — Generative design + styling tips
  - Gemini API — Language refinement for fashion prompts
  - Replicate (Stable Diffusion) — Image generation
- Authentication: Firebase Auth (Email/Password + Google OAuth)
- Voice Input: Web Speech API
- Hosting: Netlify 

# Getting Started

1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/fashaura.git
cd fashaura/public

2. Run the project

Open index.html in your browser to view the landing page
Open chatbot.html to use the AI-powered fashion studio