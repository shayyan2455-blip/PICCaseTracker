import { describe, it, expect, vi, beforeEach } from 'vitest'

const h = vi.hoisted(() => ({
  getUser: vi.fn(),
  listUsers: vi.fn(),
  createUser: vi.fn(),
  getUserById: vi.fn(),
  updateUserById: vi.fn(),
  fromChains: {},
  defaultChain: null,
  sendMail: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: h.getUser,
      admin: {
        listUsers: h.listUsers,
        createUser: h.createUser,
        getUserById: h.getUserById,
        updateUserById: h.updateUserById,
      },
    },
    from: (table) => h.fromChains[table] || h.defaultChain,
  }),
}))

vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail: h.sendMail }) },
}))

function makeChain(overrides = {}) {
  const resolveTo = overrides.resolveTo
  const chain = {}
  Object.assign(chain, {
    select: () => chain,
    eq: () => chain,
    ilike: () => chain,
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
  // When resolveTo is set, the chain is awaitable and resolves to it — lets a
  // test stub the result of an awaited `from(...).select(...).eq(...)` query.
  if (resolveTo !== undefined) {
    chain.then = (onFulfilled) => Promise.resolve(resolveTo).then(onFulfilled)
  }
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
    h.fromChains = {}
    h.defaultChain = makeChain()
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
    h.fromChains.members = makeChain({
      maybeSingle: async () => ({ data: { role: 'lawyer' }, error: null }),
    })
    const res = await invoke(
      { type: 'invite-user', email: 'a@b.com', role: 'lawyer', orgId: 'org-1' },
      { authorization: 'Bearer valid-token' }
    )
    expect(res.statusCode).toBe(403)
    expect(res.payload.error).toBe('Only the organization owner can invite members')
  })

  it('lets a verified owner invite a new user via the profiles mirror', async () => {
    h.getUser.mockResolvedValue({ data: { user: { id: 'user-owner' } }, error: null })
    h.fromChains.members = makeChain({
      maybeSingle: async () => ({ data: { role: 'owner' }, error: null }),
      insert: async () => ({ data: null, error: null }),
    })
    h.fromChains.profiles = makeChain({
      maybeSingle: async () => ({ data: null, error: null }),
    })
    h.createUser.mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null })

    const res = await invoke(
      { type: 'invite-user', email: 'new@b.com', role: 'lawyer', orgId: 'org-1' },
      { authorization: 'Bearer valid-token' }
    )
    expect(res.statusCode).toBe(200)
    expect(res.payload.success).toBe(true)
    expect(h.createUser).toHaveBeenCalled()
    expect(h.sendMail).toHaveBeenCalled()
    expect(h.listUsers).not.toHaveBeenCalled()
  })

  it('adds an existing account to the org without creating a new one', async () => {
    h.getUser.mockResolvedValue({ data: { user: { id: 'user-owner' } }, error: null })
    h.fromChains.members = makeChain({
      maybeSingle: vi
        .fn()
        .mockResolvedValueOnce({ data: { role: 'owner' }, error: null })
        .mockResolvedValueOnce({ data: null, error: null }),
      insert: async () => ({ data: null, error: null }),
    })
    h.fromChains.profiles = makeChain({
      maybeSingle: async () => ({ data: { id: 'existing-user', email: 'new@b.com' }, error: null }),
    })

    const res = await invoke(
      { type: 'invite-user', email: 'new@b.com', role: 'lawyer', orgId: 'org-1' },
      { authorization: 'Bearer valid-token' }
    )
    expect(res.statusCode).toBe(200)
    expect(res.payload).toMatchObject({ success: true, existing: true })
    expect(h.createUser).not.toHaveBeenCalled()
    expect(h.sendMail).toHaveBeenCalled()
  })

  it('sends an OTP for an existing account found via the profiles mirror', async () => {
    h.fromChains.profiles = makeChain({
      maybeSingle: async () => ({ data: { id: 'user-1', email: 'a@b.com' }, error: null }),
    })
    const res = await invoke({ type: 'send-otp', email: 'A@B.COM' })
    expect(res.statusCode).toBe(200)
    expect(res.payload.success).toBe(true)
    expect(h.sendMail).toHaveBeenCalled()
    expect(h.listUsers).not.toHaveBeenCalled()
  })

  it('returns an error for send-otp when the email has no profile', async () => {
    h.fromChains.profiles = makeChain({
      maybeSingle: async () => ({ data: null, error: null }),
    })
    const res = await invoke({ type: 'send-otp', email: 'nobody@b.com' })
    expect(res.statusCode).toBe(400)
    expect(res.payload.error).toBe('No account found with this email address')
    expect(h.sendMail).not.toHaveBeenCalled()
  })

  it('resets a password via the profiles mirror instead of listUsers', async () => {
    h.updateUserById.mockResolvedValue({ data: { user: {} }, error: null })
    h.fromChains.password_resets = makeChain({
      maybeSingle: async () => ({ data: { id: 'reset-1' }, error: null }),
    })
    h.fromChains.profiles = makeChain({
      maybeSingle: async () => ({ data: { id: 'user-1', email: 'a@b.com' }, error: null }),
    })
    const res = await invoke({
      type: 'reset-password',
      email: 'a@b.com',
      otp: '12345678',
      password: 'newpass1',
    })
    expect(res.statusCode).toBe(200)
    expect(res.payload.success).toBe(true)
    expect(h.updateUserById).toHaveBeenCalledWith('user-1', { password: 'newpass1' })
    expect(h.listUsers).not.toHaveBeenCalled()
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
    expect(h.getUserById).not.toHaveBeenCalled()
  })

  it('batches profile lookups per org in sendDailyReminders', async () => {
    h.getUser.mockResolvedValue({ data: { user: { id: 'me' } }, error: null })
    const tomorrow = new Date()
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    const dueDate = tomorrow.toISOString().split('T')[0]

    h.fromChains.hearings = makeChain({
      resolveTo: {
        data: [
          { id: 'h1', case_id: 'c1', due_date: dueDate, cases: { title: 'Case', organization_id: 'org-1' } },
        ],
        error: null,
      },
    })
    h.fromChains.org_reminder_prefs = makeChain({
      resolveTo: { data: [{ organization_id: 'org-1', enabled: true, days_before: 2 }], error: null },
    })
    h.fromChains.members = makeChain({
      resolveTo: { data: [{ user_id: 'u1' }, { user_id: 'u2' }], error: null },
    })
    h.fromChains.profiles = makeChain({
      resolveTo: { data: [{ id: 'u1', email: 'one@x.com' }, { id: 'u2', email: 'two@x.com' }], error: null },
    })
    h.sendMail.mockResolvedValue({})

    const res = await invoke({ type: 'daily' }, { authorization: 'Bearer valid-token' })
    expect(res.statusCode).toBe(200)
    expect(res.payload.sent).toBe(2)
    expect(h.getUserById).not.toHaveBeenCalled()
  })
})
