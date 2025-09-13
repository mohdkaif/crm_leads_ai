export default defineEventHandler(async (event) => {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    }

    // Optional: Check database connection
    try {
      // Add database health check here if needed
      // const db = await connectDB()
      // await db.admin().ping()
      health.database = 'connected'
    } catch (error) {
      health.database = 'disconnected'
      health.status = 'degraded'
    }

    setResponseStatus(event, 200)
    return health
  } catch (error) {
    setResponseStatus(event, 500)
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})
