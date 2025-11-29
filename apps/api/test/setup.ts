import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Socket } from 'node:net';

const checkPort = (port: number, host = 'localhost'): Promise<boolean> =>
  new Promise((resolve) => {
    const s = new Socket();
    const timeout = setTimeout(() => {
      s.destroy();
      resolve(false);
    }, 2000);

    s.connect(port, host, () => {
      clearTimeout(timeout);
      s.destroy();
      resolve(true);
    });

    s.on('error', () => {
      clearTimeout(timeout);
      s.destroy();
      resolve(false);
    });
  });

const waitForService = async (port: number, maxAttempts = 30) => {
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkPort(port)) {
      return;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Service on port ${port} failed to start`);
};

export default async () => {
  const isCI = process.env.CI === 'true';

  if (!isCI) {
    dotenv.config({
      path: path.resolve(process.cwd(), '.env.test'),
    });

    const dockerComposePath = path.resolve(
      process.cwd(),
      '../../docker-compose.test.yml',
    );

    execSync(`docker compose -f ${dockerComposePath} up -d`, {
      stdio: 'inherit',
    });

    const dbPort = parseInt(process.env.POSTGRES_PORT || '5432', 10);
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

    await Promise.all([waitForService(dbPort), waitForService(redisPort)]);

    await new Promise((r) => setTimeout(r, 2000));
  }

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    cwd: path.resolve(process.cwd()),
  });
};
