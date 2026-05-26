import 'dotenv/config'
import { connectDb } from './config/db.js'
import { Organization } from './models/Organization.js'

const seedOrgs = [
  {
    name: 'Trizen Ventures',
    slug: 'trizen-ventures',
    plan: 'pro',
    collaboratorCount: 48,
    projectCount: 12,
    status: 'active',
    adminEmail: 'admin@trizenventures.com',
    inviteStatus: 'sent',
    inviteSentAt: new Date('2024-01-15'),
  },
  {
    name: 'Nova Labs',
    slug: 'nova-labs',
    plan: 'enterprise',
    collaboratorCount: 120,
    projectCount: 34,
    status: 'active',
    adminEmail: 'support@trizenventures.com',
    inviteStatus: 'sent',
  },
  {
    name: 'Pixel Studio',
    slug: 'pixel-studio',
    plan: 'free',
    collaboratorCount: 8,
    projectCount: 3,
    status: 'active',
    adminEmail: 'support@trizenventures.com',
    inviteStatus: 'sent',
  },
]

async function seed() {
  await connectDb()
  for (const data of seedOrgs) {
    await Organization.findOneAndUpdate({ slug: data.slug }, data, {
      upsert: true,
      new: true,
    })
    console.log(`Seeded: ${data.name}`)
  }
  console.log('Done.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
