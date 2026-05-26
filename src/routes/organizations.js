import { Router } from 'express'
import { z } from 'zod'
import { Organization } from '../models/Organization.js'
import { AuditLog } from '../models/AuditLog.js'
import { sendOrganizationInvite } from '../services/mailClient.js'
import { serializeOrganization } from '../utils/serializeOrg.js'

export const organizationsRouter = Router()

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  plan: z.enum(['free', 'pro', 'enterprise']).default('free'),
  adminEmail: z.string().email(),
})

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  plan: z.enum(['free', 'pro', 'enterprise']).optional(),
})

organizationsRouter.get('/', async (_req, res, next) => {
  try {
    const orgs = await Organization.find().sort({ createdAt: -1 })
    res.json(orgs.map(serializeOrganization))
  } catch (err) {
    next(err)
  }
})

organizationsRouter.get('/:id/stats', async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id)
    if (!org) return res.status(404).json({ error: 'Organization not found' })
    res.json({
      users: org.collaboratorCount ?? 0,
      projects: org.projectCount ?? 0,
      tasks: 0,
    })
  } catch (err) {
    next(err)
  }
})

organizationsRouter.post('/', async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body)
    const slug = body.slug.toLowerCase()

    const existing = await Organization.findOne({ slug })
    if (existing) {
      return res.status(409).json({ error: 'Slug already in use' })
    }

    const org = await Organization.create({
      name: body.name,
      slug,
      plan: body.plan,
      adminEmail: body.adminEmail.toLowerCase(),
      collaboratorCount: 1,
      projectCount: 0,
      status: 'active',
      inviteStatus: 'pending',
    })

    const demoPassword = process.env.DEFAULT_ORG_ADMIN_PASSWORD || 'admin123'

    try {
      await sendOrganizationInvite({
        organizationName: org.name,
        slug: org.slug,
        plan: org.plan,
        adminEmail: org.adminEmail,
        demoPassword,
        createdBy: 'System Administrator',
      })
      org.inviteStatus = 'sent'
      org.inviteSentAt = new Date()
      await org.save()
    } catch (mailErr) {
      org.inviteStatus = 'failed'
      await org.save()
      console.error('Invite email failed:', mailErr.message)
      return res.status(502).json({
        error: `Organization saved but invite email failed: ${mailErr.message}`,
        organization: serializeOrganization(org),
      })
    }

    await AuditLog.create({
      action: 'Organization created',
      actor: 'System Administrator',
      target: org.name,
    })

    res.status(201).json(serializeOrganization(org))
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.flatten() })
    }
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Slug already in use' })
    }
    next(err)
  }
})

organizationsRouter.patch('/:id', async (req, res, next) => {
  try {
    const body = updateSchema.parse(req.body)
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { $set: body },
      { new: true, runValidators: true }
    )
    if (!org) return res.status(404).json({ error: 'Organization not found' })

    await AuditLog.create({
      action: 'Organization updated',
      actor: 'System Administrator',
      target: org.name,
    })

    res.json(serializeOrganization(org))
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.flatten() })
    }
    next(err)
  }
})

organizationsRouter.post('/:id/resend-invite', async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id)
    if (!org) return res.status(404).json({ error: 'Organization not found' })

    const demoPassword = process.env.DEFAULT_ORG_ADMIN_PASSWORD || 'admin123'

    await sendOrganizationInvite({
      organizationName: org.name,
      slug: org.slug,
      plan: org.plan,
      adminEmail: org.adminEmail,
      demoPassword,
      createdBy: 'System Administrator',
    })

    org.inviteStatus = 'sent'
    org.inviteSentAt = new Date()
    await org.save()

    await AuditLog.create({
      action: 'Organization invite resent',
      actor: 'System Administrator',
      target: org.name,
    })

    res.json(serializeOrganization(org))
  } catch (err) {
    console.error('Invite email failed:', err.message)
    return res.status(502).json({
      error: `Invite email failed: ${err.message}`,
    })
  }
})

organizationsRouter.post('/:id/suspend', async (req, res, next) => {
  try {
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    )
    if (!org) return res.status(404).json({ error: 'Organization not found' })

    await AuditLog.create({
      action: 'Organization suspended',
      actor: 'System Administrator',
      target: org.name,
    })

    res.json(serializeOrganization(org))
  } catch (err) {
    next(err)
  }
})

organizationsRouter.delete('/:id', async (req, res, next) => {
  try {
    const org = await Organization.findByIdAndDelete(req.params.id)
    if (!org) return res.status(404).json({ error: 'Organization not found' })

    await AuditLog.create({
      action: 'Organization deleted',
      actor: 'System Administrator',
      target: org.name,
    })

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
