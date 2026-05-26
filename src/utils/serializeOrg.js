export function serializeOrganization(doc) {
  const o = doc.toObject ? doc.toObject() : doc
  return {
    id: String(o._id),
    name: o.name,
    slug: o.slug,
    plan: o.plan,
    collaboratorCount: o.collaboratorCount ?? 0,
    projectCount: o.projectCount ?? 0,
    createdAt: o.createdAt
      ? new Date(o.createdAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    status: o.status,
    adminEmail: o.adminEmail,
    inviteStatus: o.inviteStatus,
    inviteSentAt: o.inviteSentAt,
  }
}
