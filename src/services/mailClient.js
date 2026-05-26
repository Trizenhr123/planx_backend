export async function sendOrganizationInvite(payload) {
  const baseUrl = process.env.MAIL_SERVICE_URL || 'http://localhost:4001'
  const apiKey = process.env.MAIL_SERVICE_API_KEY

  if (!apiKey) {
    throw Object.assign(new Error('MAIL_SERVICE_API_KEY is not configured'), { status: 500 })
  }

  let res
  try {
    res = await fetch(`${baseUrl}/send/organization-invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'fetch failed'
    throw Object.assign(
      new Error(
        `Mail service unreachable at ${baseUrl} (${reason}). Start it: cd planx-mail-service && npm run dev`,
      ),
      { status: 503, cause: err },
    )
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw Object.assign(
      new Error(data.error?.message || data.error || 'Mail service request failed'),
      { status: res.status || 502 }
    )
  }
  return data
}
