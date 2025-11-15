import { execSync } from 'child_process';

export default () => {
  execSync('docker compose -f ../../docker-compose.test.yml down -v', {
    stdio: 'inherit',
  });
};
