import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateUserNames() {
  console.log('Starting user name migration...')
  
  try {
    // First, add the name column to store the combined name
    await prisma.$executeRaw`ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;`
    
    // Update existing users to combine firstName and lastName into name
    await prisma.$executeRaw`
      UPDATE users 
      SET name = CONCAT(COALESCE("firstName", ''), ' ', COALESCE("lastName", ''))
      WHERE name IS NULL OR name = '';
    `
    
    // Clean up any extra whitespace
    await prisma.$executeRaw`
      UPDATE users 
      SET name = TRIM(name)
      WHERE name IS NOT NULL;
    `
    
    // Set name as NOT NULL (will be handled by the schema migration)
    // For now, let's make sure no user has an empty name
    await prisma.$executeRaw`
      UPDATE users 
      SET name = 'Unknown User'
      WHERE name IS NULL OR name = '' OR TRIM(name) = '';
    `
    
    console.log('✅ Successfully migrated user names')
    
    // Get count of updated users
    const userCount = await prisma.user.count()
    console.log(`📊 Total users: ${userCount}`)
    
    // Show some sample data using raw SQL since Prisma client doesn't know about 'name' field yet
    const sampleUsers = await prisma.$queryRaw`
      SELECT id, email, name FROM users LIMIT 5;
    ` as any[]
    
    console.log('📋 Sample users after migration:')
    sampleUsers.forEach((user: any) => {
      console.log(`  - ${user.email}: "${user.name}"`)
    })
    
  } catch (error) {
    console.error('❌ Error during migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  migrateUserNames()
    .then(() => {
      console.log('🎉 Migration completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error)
      process.exit(1)
    })
}

export { migrateUserNames }
