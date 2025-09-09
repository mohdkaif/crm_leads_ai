import mongoose from 'mongoose'

declare global {
  var mongoose: any
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      retryWrites: true,
      retryReads: true,
    }

    cached.promise = mongoose.connect(process.env.MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully')
      
      // Add connection event handlers
      mongoose.connection.on('connected', () => {
        console.log('📡 MongoDB connected')
      })
      
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err)
      })
      
      mongoose.connection.on('disconnected', () => {
        console.log('🔌 MongoDB disconnected')
      })
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected')
      })
      
      return mongoose
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error)
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
