import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI or DATABASE_URL environment variable inside .env'
  );
}

// Connect to MongoDB - allow buffering until connection is ready
if (mongoose.connection.readyState === 0) {
  mongoose.connect(MONGODB_URI).then(() => {
    console.log('MongoDB connected for better-auth');
  }).catch((err) => {
    console.error('MongoDB connection error:', err);
  });
}

export const auth = betterAuth({
  database: mongodbAdapter(mongoose.connection),
  debug: true,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scopes: ["openid", "email", "profile"],
      redirectURI: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/callback/google`,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/callback/github`,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: ["http://localhost:3000"],
})

export type Session = typeof auth.$Infer.Session

