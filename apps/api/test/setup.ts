import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

export default async () => {
  if (!process.env.CI) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

    execSync('docker compose -f ../../docker-compose.test.yml up -d', {
      stdio: 'inherit',
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
};
