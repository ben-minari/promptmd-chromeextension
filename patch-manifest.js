const fs = require('fs')
const path = require('path')

const manifestPath = path.join(__dirname, 'build', 'chrome-mv3-prod', 'manifest.json')
const clientId = process.env.PLASMO_PUBLIC_GOOGLE_CLIENT_ID_PROD || '725964297899-ph030pbskpcmrqvaemsmo93pp6an3keo.apps.googleusercontent.com'

if (!fs.existsSync(manifestPath)) {
  console.error('Manifest file not found:', manifestPath)
  process.exit(1)
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))

manifest.oauth2 = manifest.oauth2 || {}
manifest.oauth2.client_id = clientId

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
console.log('Patched manifest.json with oauth2.client_id') 