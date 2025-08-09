import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('⏭️ Skipping fix-relationships script - schema updated to new structure')
  console.log('✅ Payment flow now uses database-first approach')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
