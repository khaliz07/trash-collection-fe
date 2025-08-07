#!/usr/bin/env node
const { networkInterfaces } = require('os')

function getLocalIP() {
  const nets = networkInterfaces()
  const results = []

  for (const name of Object.keys(nets)) {
    const net = nets[name]
    if (!net) continue

    for (const netInterface of net) {
      if (netInterface.family === 'IPv4' && !netInterface.internal) {
        results.push(netInterface.address)
      }
    }
  }

  return results[0] || 'localhost'
}

function displayNetworkInfo() {
  const localIP = getLocalIP()
  const port = process.env.PORT || 3000
  
  console.log('\n🚀 Next.js Server Information:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📍 Local Access:     http://localhost:${port}`)
  console.log(`🌐 Network Access:   http://${localIP}:${port}`)
  console.log(`📱 Mobile/QR URL:    http://${localIP}:${port}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('💡 Tips:')
  console.log('   • Ensure all devices are on the same WiFi network')
  console.log('   • QR codes will automatically use the network IP')
  console.log('   • Share the network URL with team members')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

// Display info immediately
displayNetworkInfo()

// Also export for programmatic use
module.exports = { getLocalIP, displayNetworkInfo }
