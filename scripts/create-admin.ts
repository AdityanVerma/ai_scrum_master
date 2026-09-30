// One-off script: make a team member the Scrum Master (Admin) and set their login.
//
// Usage:
//   npm run create-admin -- --email you@example.com --password "your-password" --name "Your Name"
//
// - If a member with that email already exists, that member is updated.
// - Otherwise, if --name matches an existing member (case-insensitive), that member is updated.
// - Otherwise a new member is created with the job title "Scrum Master".

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const USAGE =
  'Usage: npm run create-admin -- --email <email> --password <password> --name "<member name>"';

function getArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main() {
  const email = getArg('--email')?.trim().toLowerCase();
  const password = getArg('--password');
  const name = getArg('--name')?.trim();

  if (!email || !email.includes('@') || !password) {
    throw new Error(`An email and a password are required.\n${USAGE}`);
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }

  if (Buffer.byteLength(password) > 72) {
    throw new Error('Password must be at most 72 bytes (bcrypt limit).');
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Check your .env file.');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const login = {
      email,
      passwordHash,
      accessRole: 'SCRUM_MASTER' as const,
      isActive: true,
      mustChangePassword: false,
    };

    let memberId: string;
    let action: 'Updated' | 'Created';

    const byEmail = await prisma.teamMember.findUnique({ where: { email } });

    if (byEmail) {
      await prisma.teamMember.update({
        where: { id: byEmail.id },
        data: login,
      });
      memberId = byEmail.id;
      action = 'Updated';
    } else {
      if (!name) {
        throw new Error(
          `No member has that email, so --name is required to pick an existing member or create a new one.\n${USAGE}`,
        );
      }

      const byName = await prisma.teamMember.findMany({
        where: { name: { equals: name, mode: 'insensitive' } },
      });

      if (byName.length > 1) {
        throw new Error(
          `${byName.length} members are named "${name}". Use --email of one of them or rename them first.`,
        );
      }

      if (byName.length === 1) {
        await prisma.teamMember.update({
          where: { id: byName[0].id },
          data: login,
        });
        memberId = byName[0].id;
        action = 'Updated';
      } else {
        const created = await prisma.teamMember.create({
          data: { name, role: 'Scrum Master', ...login },
        });
        memberId = created.id;
        action = 'Created';
      }
    }

    // Read the row back so the result shown is what is actually in the database.
    const saved = await prisma.teamMember.findUniqueOrThrow({
      where: { id: memberId },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        accessRole: true,
        isActive: true,
        mustChangePassword: true,
      },
    });

    console.log(`${action} Scrum Master:`);
    console.table([saved]);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
