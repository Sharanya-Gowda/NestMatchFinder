# Local Setup Guide for NestMatch

## Quick Steps for Local Development

### 1. Database Setup
Make sure your local PostgreSQL is running and create the database:

```sql
CREATE DATABASE nestmatch_db;
```

### 2. Update your .env file
Edit your `.env` file to use the correct local PostgreSQL connection:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/nestmatch_db
SESSION_SECRET=nestmatch-secret-key-change-for-production
NODE_ENV=development
```

Replace `your_password` with your actual PostgreSQL password.

### 3. Install Dependencies & Run
```bash
npm install
npm run dev
```

## Common Issues & Solutions

### "Invalid Input" Error on Signup
This was caused by database connection issues, not form validation. The fix:

1. Make sure PostgreSQL is running on your machine
2. Verify your DATABASE_URL in .env is correct
3. Check that the database `nestmatch_db` exists

### Database Connection Errors
If you see WebSocket or connection errors:

1. Ensure you're using a local PostgreSQL URL (not cloud database URL)
2. Verify PostgreSQL service is running
3. Check your credentials in .env file

The application will automatically create all necessary tables when it connects successfully.

## Troubleshooting

If signup still fails, check the console logs for specific error messages about database connectivity rather than validation errors.