# News Gathering

A news aggregation application built with Nuxt 3 and TypeScript.

## Tech Stack

- **Framework**: Nuxt 3
- **Language**: TypeScript
- **State Management**: Pinia
- **UI**: Nuxt UI (Tailwind CSS)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **News API**: newsdata.io

## Setup

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file and set the following environment variables:

```env
NUXT_PUBLIC_NEWSDATA_API_KEY=your_newsdata_api_key
NUXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NUXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Development

```bash
# Start development server
pnpm dev

# Lint
pnpm lint

# Lint with auto-fix
pnpm lint:fix

# Format
pnpm format

# Type check
pnpm typecheck

# Build
pnpm build
```

## Features

- Browse news articles (by country and category)
- Search articles
- User authentication (register, login)
- Bookmark articles
- Comment on articles
