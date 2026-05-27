export function serializeUser(doc) {
  const u = doc.toObject ? doc.toObject() : doc
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    organizationId: u.organizationId ? String(u.organizationId) : undefined,
  }
}
