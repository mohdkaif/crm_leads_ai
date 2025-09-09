export default defineEventHandler(async (event) => {
  // Clear cookies
  setCookie(event, 'auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  })

  setCookie(event, 'refresh-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  })

  return {
    success: true,
    message: 'Logged out successfully'
  }
})
