import { execSync } from 'child_process';

export default () => {
  const isCI = process.env.CI === 'true';

  if (!isCI) {
    execSync('docker compose -f ../../docker-compose.test.yml down -v', {
      stdio: 'inherit',
    });
  }
};
