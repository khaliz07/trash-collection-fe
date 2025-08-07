import { networkInterfaces } from 'os'

/**
 * Get the local IP address of the machine
 * @returns {string} The local IP address (e.g., 192.168.1.100)
 */
export function getLocalIP(): string {
  const nets = networkInterfaces()
  const results: string[] = []

  for (const name of Object.keys(nets)) {
    const net = nets[name]
    if (!net) continue

    for (const netInterface of net) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (netInterface.family === 'IPv4' && !netInterface.internal) {
        results.push(netInterface.address)
      }
    }
  }

  // Return the first non-internal IPv4 address
  return results[0] || 'localhost'
}

/**
 * Get the base URL with auto-detected IP
 * @param port - Port number (default: 3000)
 * @returns {string} Full base URL (e.g., http://192.168.1.100:3000)
 */
export function getBaseURL(port: number = 3000): string {
  if (typeof window !== 'undefined') {
    // Client side - use window.location
    return `${window.location.protocol}//${window.location.host}`
  }
  
  // Server side - detect local IP
  const localIP = getLocalIP()
  return `http://${localIP}:${port}`
}

/**
 * Display available network addresses
 */
export function displayNetworkInfo(port: number = 3000): void {
  const localIP = getLocalIP()
  
  console.log('\n🌐 Network Information:')
  console.log(`   Local:   http://localhost:${port}`)
  console.log(`   Network: http://${localIP}:${port}`)
  console.log('\n📱 Mobile Access:')
  console.log(`   Scan QR codes will use: http://${localIP}:${port}`)
  console.log('   Make sure devices are on the same WiFi network!\n')
}
