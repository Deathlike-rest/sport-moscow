import type { FastifyInstance } from 'fastify'
import { prisma } from '../../db/client.js'
import { config } from '../../config.js'

interface GoogleTokenResponse {
  access_token: string
  error?: string
}

interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture?: string
  verified_email?: boolean
}

export async function googleAuthRoutes(app: FastifyInstance) {
  // GET /auth/google — redirect to Google OAuth
  app.get('/google', async (request, reply) => {
    if (!config.GOOGLE_CLIENT_ID) {
      return reply.status(503).send({ message: 'Google OAuth не настроен' })
    }
    const params = new URLSearchParams({
      client_id: config.GOOGLE_CLIENT_ID,
      redirect_uri: config.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account',
    })
    return reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
  })

  // GET /auth/google/callback — handle Google OAuth callback
  app.get('/google/callback', async (request, reply) => {
    const { code, error } = request.query as { code?: string; error?: string }

    if (error || !code) {
      return reply.redirect(`${config.FRONTEND_URL}/login?error=google_cancelled`)
    }

    // Exchange code for access token
    let accessToken: string
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: config.GOOGLE_CLIENT_ID,
          client_secret: config.GOOGLE_CLIENT_SECRET,
          redirect_uri: config.GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      })
      const tokenData = (await tokenRes.json()) as GoogleTokenResponse
      if (!tokenRes.ok || tokenData.error) {
        return reply.redirect(`${config.FRONTEND_URL}/login?error=google_token_failed`)
      }
      accessToken = tokenData.access_token
    } catch {
      return reply.redirect(`${config.FRONTEND_URL}/login?error=google_token_failed`)
    }

    // Get user info from Google
    let googleUser: GoogleUserInfo
    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!userRes.ok) {
        return reply.redirect(`${config.FRONTEND_URL}/login?error=google_userinfo_failed`)
      }
      googleUser = (await userRes.json()) as GoogleUserInfo
    } catch {
      return reply.redirect(`${config.FRONTEND_URL}/login?error=google_userinfo_failed`)
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId: googleUser.id }, { email: googleUser.email }] },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          googleId: googleUser.id,
          displayName: googleUser.name || null,
          avatarUrl: googleUser.picture || null,
        },
      })
    } else if (!user.googleId) {
      // Link existing email account to Google
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.id,
          avatarUrl: user.avatarUrl ?? googleUser.picture ?? null,
        },
      })
    }

    const token = await reply.jwtSign({ sub: user.id, role: user.role })

    const userData = encodeURIComponent(
      JSON.stringify({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      })
    )

    return reply.redirect(`${config.FRONTEND_URL}/auth/callback?token=${token}&user=${userData}`)
  })
}
