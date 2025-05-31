# NestMatch - PG Finder Platform

A comprehensive PG (Paying Guest) finder platform built with React, Node.js, and PostgreSQL. Features property listings, booking management, roommate compatibility matching, and integrated payment tracking.

## Features

- **Dual User System**: Separate interfaces for property owners and tenants
- **Property Management**: Complete CRUD operations for property listings
- **Booking System**: Request, approve, and manage bookings with automatic bed tracking
- **Star Rating System**: Rate and review properties
- **Favorites**: Save properties for later viewing
- **Interactive Maps**: View properties with location markers
- **Roommate Compatibility**: Algorithm-based matching system
- **Payment Tracking**: Simple rent payment confirmation system
- **Authentication**: Secure user login and session management

## Prerequisites

Before running this project locally, ensure you have:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (version 12 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)
- **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)

## Super Simple Setup (Windows)

### Quick Start (2 Steps Only)

1. **Double-click `start.bat`** - This will automatically:
   - Check if Node.js is installed
   - Install dependencies if needed
   - Create .env file from template
   - Start the application

2. **Edit `.env` file** when prompted with your database URL

That's it! The app will be available at: `http://localhost:5000`

### Manual Setup (Alternative)

If you prefer manual setup:

1. **Get a Database URL** (choose one):
   - **Neon** (recommended, free): https://neon.tech/
   - **Supabase** (free): https://supabase.com/
   - **Railway** (free): https://railway.app/
   - Local PostgreSQL if you have it installed

2. **Edit .env file**:
```
DATABASE_URL=your-database-url-here
SESSION_SECRET=any-random-secret-key
```

3. **Run commands**:
```bash
npm install
npm run dev
```

The application automatically creates all database tables on first run.

## VS Code Setup

### Recommended Extensions

Install these VS Code extensions for the best development experience:

- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Prettier - Code formatter**
- **ESLint**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**

### VS Code Settings

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## Project Structure

```
nestmatch-pg-finder/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage interface
│   └── db-storage.ts      # Database implementation
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema definitions
└── package.json           # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate migration files

## Default Test Accounts

After setting up the database, you can create test accounts:

**Owner Account:**
- Email: owner@example.com
- Password: 123456
- Type: Owner

**User Account:**
- Email: user@example.com
- Password: 123456
- Type: User

## Key Features Walkthrough

### For Property Owners:
1. **Register/Login** as an owner
2. **Add Properties** with photos, details, and location
3. **Manage Bookings** - approve, reject, or cancel bookings
4. **Track Payments** - simple rent payment confirmation system
5. **Edit Properties** - update property details anytime

### For Users/Tenants:
1. **Register/Login** as a user
2. **Browse Properties** with filters and map view
3. **Book Properties** with move-in/move-out dates
4. **Rate Properties** - star rating system
5. **Manage Favorites** - save properties for later
6. **Track Bookings** - view booking status and history

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI, Lucide React Icons
- **State Management**: TanStack Query
- **Authentication**: Session-based auth
- **Maps**: Leaflet integration

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Ensure database exists and user has permissions

2. **Port Already in Use**
   - Change port in vite.config.ts (frontend) or server/index.ts (backend)
   - Kill existing processes: `taskkill /f /im node.exe` (Windows)

3. **Module Not Found Errors**
   - Delete node_modules and package-lock.json
   - Run `npm install` again

4. **Build Errors**
   - Check TypeScript errors in VS Code
   - Ensure all imports are correct
   - Verify environment variables are set

### Database Reset

If you need to reset the database:
```bash
npm run db:push
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in environment
2. Update DATABASE_URL to production database
3. Set a secure SESSION_SECRET
4. Build the project: `npm run build`
5. Deploy to services like Railway, Render, or Vercel

## Support

If you encounter any issues during setup:
1. Check the troubleshooting section above
2. Ensure all prerequisites are properly installed
3. Verify environment variables are correctly set
4. Check that PostgreSQL is running and accessible

## License

This project is for educational and demonstration purposes.