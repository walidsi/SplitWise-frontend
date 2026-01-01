# SplitWise Frontend

A beautiful, intuitive React application for splitting bills among friends.

## Features

- **Create & Manage Bills** - Easily create bills for any occasion
- **Add Participants** - Add friends with customizable colors
- **Track Items** - Add bill items with prices and quantities
- **Smart Splitting** - Assign items to participants or split equally
- **Real-time Summary** - See who owes what with detailed breakdowns
- **Visual Charts** - Understand the split at a glance

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Server state management
- **Framer Motion** - Animations
- **React Router** - Routing
- **Axios** - API client

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend

Make sure the Django backend is running at `http://localhost:8000`. The Vite dev server will proxy API requests automatically.

```bash
# In the backend directory
python manage.py runserver
```

## Project Structure

```
src/
├── api/
│   └── client.ts        # API client with all endpoints
├── components/
│   ├── Layout.tsx       # Main layout wrapper
│   ├── ParticipantsSection.tsx
│   ├── ItemsSection.tsx
│   ├── SummarySection.tsx
│   └── BillSettingsModal.tsx
├── pages/
│   ├── HomePage.tsx     # Bills list
│   └── BillPage.tsx     # Bill detail/editing
├── types/
│   └── index.ts         # TypeScript types
├── App.tsx
├── main.tsx
└── index.css            # Tailwind + custom styles
```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Design

The app features a warm, inviting aesthetic with:

- **Terracotta** - Primary accent color
- **Forest Green** - Success states
- **Midnight Blue** - Text and secondary elements
- **Sand** - Backgrounds and subtle UI

Typography uses **DM Sans** for body text and **Playfair Display** for headings.
