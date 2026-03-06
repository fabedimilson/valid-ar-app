const { execSync } = require('child_process');
process.env.DATABASE_URL = "postgresql://admin:adminpassword@localhost:5432/valid_ar_db?schema=public";
try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: { ...process.env } });
} catch (e) {
  // ignore error, stdio handles it
}
