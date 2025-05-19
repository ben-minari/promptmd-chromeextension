import type { PlasmoManifest } from "plasmo"

const config = {
  manifest: {
    oauth2: {
      client_id: process.env.PLASMO_PUBLIC_GOOGLE_CLIENT_ID_PROD
    }
  }
} satisfies { manifest: Partial<PlasmoManifest> }

export default config 