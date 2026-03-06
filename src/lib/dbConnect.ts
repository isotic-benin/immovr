import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_URI environment variable inside .env.local"
    );
}

// Global is used here to maintain a cached connection across hot reloads in development.
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function initializeDefaultAdmin() {
    try {
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            const email = process.env.DEFAULT_ADMIN_EMAIL;
            const password = process.env.DEFAULT_ADMIN_PASSWORD;

            if (email && password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await Admin.create({
                    email,
                    password: hashedPassword,
                    role: "superadmin",
                });
                console.log(`[SYS] Default admin created successfully: ${email}`);
            } else {
                console.warn("[SYS] No admin users exist, and DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD are not set in environment variables.");
            }
        }
    } catch (e) {
        console.error("[SYS] Error initializing default admin:", e);
    }
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongoose) => {
            // Check for default admin after successful connection
            await initializeDefaultAdmin();
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;
