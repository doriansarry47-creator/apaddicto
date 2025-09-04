module.exports = {
  apps: [
    {
      name: 'apaddicto-server',
      script: 'npx',
      args: 'tsx server/index.ts',
      cwd: '/home/user/webapp',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
        // DATABASE_URL and SESSION_SECRET should be set as environment variables
        // Do not hardcode credentials in configuration files
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
        // DATABASE_URL and SESSION_SECRET should be set as environment variables
        // Do not hardcode credentials in configuration files
      }
    }
  ]
};