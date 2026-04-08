import dns from "dns";
dns.setServers(["8.8.8.8","1.1.1.1"]);


import mongoose from "mongoose";

/**
 * Connect to MongoDB using the URI from environment variables.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}
