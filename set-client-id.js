const fs = require('fs')
const path = require('path')

const devClientId = process.env.PLASMO_PUBLIC_GOOGLE_CLIENT_ID_DEV
const prodClientId = process.env.PLASMO_PUBLIC_GOOGLE_CLIENT_ID_PROD
const clientEnv = process.env.CLIENT_ENV || 'prod'

const packageJsonPath = path.join(__dirname, 'package.json')
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

if (!pkg.manifest || !pkg.manifest.oauth2) {
  console.error('No manifest.oauth2 section found in package.json')
  process.exit(1)
}

const newClientId = clientEnv === 'dev' ? devClientId : prodClientId
if (!newClientId) {
  console.error(`Missing client ID for env: ${clientEnv}`)
  process.exit(1)
}

pkg.manifest.oauth2.client_id = newClientId

fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n')
console.log(`Set manifest.oauth2.client_id to ${newClientId} for ${clientEnv} environment.`) 