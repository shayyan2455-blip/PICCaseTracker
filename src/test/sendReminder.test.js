import { describe, it, expect, vi, beforeEach } from 'vitest'

const h = vi.hoisted(() => ({
  getUser: vi.fn(),
  listUsers: vi.fn(),
  createUser: vi.fn(),
  fromChain: null,
  sendMail: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: h.getUser,
      admin: {
        listUsers: h.listUsers,
        createUser: h.createUser,
        getUserById: vi.fn(),
        updateUserById: vi.fn(),
      },
    },
    from: () => h.fromChain,
  }),
}))

vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail: h.sendMail }) },
}))

function makeChain(overrides = {}) {
  const chain = {}
  Object.assign(chain, {
    select: () => chain,
    eq: () => chain,
    in: () => chain,
    gte: () => chain,
    lte: () => chain,
    order: () => chain,
    limit: () => chain,
    maybeSingle: overrides.maybeSingle || (async () => ({ data: null, error: null })),
    insert: overrides.insert || (async () => ({ data: null, error: null })),
    update: () => chain,
    delete: () => chain,
  })
  return chain
}

async function invoke(body, headers = {}) {
  vi.resetModules()
  const { default: handler } = await import('../../api/send-reminder.js')
  const res = {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.payload = payload
      return this
    },
  }
  await handler({ body, headers }, res)
  return res
}

describe('send-reminder auth guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GMAIL_SMTP_USER = 'test@example.com'
    process.env.GMAIL_SMTP_PASS = 'testpass'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
    process.env.VITE_SUPABASE_URL = 'https://example.supabase.co'
    h.fromChain = makeChain()
  })

  it('returns 401 for invite-user without an Authorization header', async () => {
    const res = await invoke({
      type: 'invite-user',
      email: 'a@b.com',
      role: 'lawyer',
      orgId: 'org-1',
    })
    expect(res.statusCode).toBe(401)
    expect(h.listUsers).not.toHaveBeenCalled()
  })

  it('returns 401 for invite-user with an invalid token', async () => {
    h.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'JWT expired' } })
    const res = await invoke(
      { type: 'invite-user', email: 'a@b.com', role: 'lawyer', orgId: 'org-1' },
      { authorization: 'Bearer invalid-token' }
    )
    expect(res.statusCode).toBe(401)
    expect(h.listUsers).not.toHaveBeenCalled()
  })

  it('returns 403 when the verified caller is not an owner', async () => {
    h.getUser.mockResolvedValue({ data: { user: { id: 'user-lawyer' } }, error: null })
    h.fromChain = makeChain({
      maybeSingle: async () => ({ data: { role: 'lawyer' }, error: null }),
    })
    const res = await invoke(
      { type: 'invite-user', email: 'a@b.com', role: 'lawyer', orgId: 'org-1' },
      { authorization: 'Bearer valid-token' }
    )
    expect(res.statusCode).toBe(403)
    expect(res.payload.error).toBe('Only the organization owner can invite members')
  })

  it('lets a verified owner invite a new user end to end', async () => {
    h.getUser.mockResolvedValue({ data: { user: { id: 'user-owner' } }, error: null })
    h.fromChain = makeChain({
      maybeSingle: async () => ({ data: { role: 'owner' }, error: null }),
      insert: async () => ({ data: null, error: null }),
    })
    h.listUsers.mockResolvedValue({ data: { users: [] }, error: null })
    h.createUser.mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null })

    const res = await invoke(
      { type: 'invite-user', email: 'new@b.com', role: 'lawyer', orgId: 'org-1' },
      { authorization: 'Bearer valid-token' }
    )
    expect(res.statusCode).toBe(200)
    expect(res.payload.success).toBe(true)
    expect(h.createUser).toHaveBeenCalled()
    expect(h.sendMail).toHaveBeenCalled()
  })

  it('returns 401 for a manual daily trigger without a token', async () => {
    const res = await invoke({ type: 'daily' })
    expect(res.statusCode).toBe(401)
  })

  it('returns 401 for a test email without a token', async () => {
    const res = await invoke({ type: 'test', to: 'someone@example.com' })
    expect(res.statusCode).toBe(401)
  })

  it('does not require a token when the Vercel cron header is present', async () => {
    const res = await invoke({}, { 'x-vercel-cron': '1' })
    expect(res.statusCode).toBe(200)
    expect(res.payload.sent).toBe(0)
  })
})
