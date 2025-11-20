# Database Migration Guide: SQLite (Prisma) to MongoDB (Mongoose)

This project has been migrated from Prisma with SQLite to Mongoose with MongoDB.

## Changes Made

### 1. Dependencies
- **Removed**: `@prisma/client`, `prisma`
- **Added**: `mongoose`

### 2. Database Models
All Prisma models have been converted to Mongoose schemas:
- `lib/models/User.ts`
- `lib/models/Account.ts`
- `lib/models/Session.ts`
- `lib/models/Verification.ts`
- `lib/models/Profile.ts`
- `lib/models/Listing.ts`
- `lib/models/Bartr.ts`
- `lib/models/Message.ts`
- `lib/models/Notification.ts`
- `lib/models/Review.ts`
- `lib/models/Badge.ts`
- `lib/models/UserBadge.ts`

### 3. Database Connection
- Created `lib/mongodb.ts` for MongoDB connection management
- Connection uses singleton pattern for optimal performance in Next.js

### 4. Authentication
- Updated `lib/auth.ts` to use `mongodbAdapter` instead of `prismaAdapter`
- Better-auth now uses MongoDB adapter

### 5. API Routes
All API routes have been updated to use Mongoose instead of Prisma:
- `/app/api/listings/**`
- `/app/api/bartrs/**`

## Setup Instructions

### 1. Install MongoDB

#### Option A: Local MongoDB
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# Download and install from https://www.mongodb.com/try/download/community
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Whitelist your IP address

### 2. Update Environment Variables

Update your `.env` file:

```env
# For local MongoDB
MONGODB_URI="mongodb://localhost:27017/bartr"

# For MongoDB Atlas
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>/bartr?retryWrites=true&w=majority"

# Keep existing Better Auth variables
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Application

```bash
npm run dev
```

The application will automatically connect to MongoDB and create indexes as needed.

## Key Differences

### ID Fields
- **Prisma**: Used `cuid()` for IDs stored as strings
- **Mongoose**: Uses MongoDB's native `ObjectId`, converted to strings in responses

### Queries
- **Prisma**:
  ```typescript
  await prisma.listing.findMany({ where: { status: "ACTIVE" } })
  ```
- **Mongoose**:
  ```typescript
  await Listing.find({ status: "ACTIVE" })
  ```

### Relations
- **Prisma**: Automatic relation handling with `include`
- **Mongoose**: Manual population or separate queries (we use separate queries for better control)

### Case-Insensitive Search
- **Prisma**: `{ contains: search, mode: "insensitive" }`
- **Mongoose**: `{ $regex: search, $options: "i" }`

## Data Migration (if needed)

If you have existing data in SQLite that needs to be migrated to MongoDB:

1. Export data from SQLite
2. Transform the data format (mainly ID fields)
3. Import into MongoDB

You can use the provided migration script (if available) or use tools like:
- [Prisma to MongoDB migration tools](https://www.npmjs.com/search?q=prisma%20mongodb%20migration)
- Custom Node.js scripts

## Troubleshooting

### Connection Issues
- Verify MongoDB is running: `mongosh` (for local) or check Atlas dashboard
- Check connection string format
- Ensure IP whitelist is configured (for Atlas)

### Authentication Issues
- Clear better-auth collections in MongoDB
- Verify `BETTER_AUTH_SECRET` is set
- Check that `mongodbAdapter` is properly configured

### Query Issues
- Remember to call `.lean()` for better performance when you don't need Mongoose document methods
- Convert `_id` to string when sending responses to frontend
- Use `connectDB()` at the start of each API route

## Files Removed

The following Prisma-related files can be safely deleted:
- `prisma/` directory (including schema.prisma and migrations)
- `prisma.config.ts`
- `lib/prisma.ts`

However, they have been kept for reference during the transition period.
