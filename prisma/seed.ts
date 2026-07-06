import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // await prisma.cohortCounter.upsert({
  //   where: { id: 'singleton' },
  //   update: {},
  //   create: { id: 'singleton', founders: 0, early: 0, total: 0 },
  // });
  console.log('Seeded database (empty for now)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
