import mongoose from 'mongoose'

const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 60_000,
  connectTimeoutMS: 60_000,
  socketTimeoutMS: 60_000,
}

export async function connectDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is required in planx-backend/.env')
  }

  try {
    await mongoose.connect(uri, CONNECT_OPTIONS)
    console.log(`MongoDB connected (${mongoose.connection.host})`)
  } catch (err) {
    const hint =
      err.name === 'MongoNetworkTimeoutError' || err.name === 'MongoServerSelectionError'
        ? [
            'Could not reach MongoDB Atlas in time. Check:',
            '  • Internet / VPN / firewall (port 27017)',
            '  • Atlas → Network Access → add your IP or 0.0.0.0/0 for dev',
            '  • If the DB password contains @ # etc., URL-encode it in MONGODB_URI (e.g. @ → %40)',
          ].join('\n')
        : null
    if (hint) {
      console.error(hint)
    }
    throw err
  }
}
