# HireTrack — AI-Powered Job Application Tracker

## Overview
A premium fullstack job application tracker with AI-powered 
resume matching, drag-and-drop kanban board, and beautiful analytics.

## Features
- JWT Authentication (register, login, refresh tokens)
- Drag-and-drop Kanban board
- AI Resume Match scoring (Groq API / Llama 3.1)
- Analytics dashboard with charts
- Real-time stats and pipeline visualization
- Settings with profile management

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI**: shadcn/ui, Framer Motion, Recharts
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: Custom JWT (access + refresh tokens)
- **AI**: Groq API (Llama 3.1 8B)
- **State**: Zustand + TanStack Query
- **Deployment**: Vercel

## Local Setup
1. Clone: `git clone https://github.com/Zakuroooo/Hiretrack.git`
2. Install: `npm install`
3. Create `.env.local` with required variables
4. Run: `npm run dev`
5. Open: `http://localhost:3000`

## Environment Variables
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
GROQ_API_KEY=
EMAIL_USER=
EMAIL_PASS=
NEXT_PUBLIC_APP_URL=

## Deployment
1. Push to GitHub
2. Import in vercel.com
3. Add environment variables
4. Deploy
