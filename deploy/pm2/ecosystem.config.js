module.exports = {
  apps: [
    {
      name: 'vma-api',
      cwd: '/home/gladius/Codes/project/backend',
      script: 'src/index.js',
      node_args: '--trace-warnings',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_HOST: process.env.DB_HOST || '127.0.0.1',
        DB_PORT: process.env.DB_PORT || 5432,
        DB_NAME: process.env.DB_NAME || 'vma_calculator',
        DB_USER: process.env.DB_USER || 'postgres',
        DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
        JWT_SECRET: process.env.JWT_SECRET,
        MJ_APIKEY_PUBLIC: process.env.MJ_APIKEY_PUBLIC,
        MJ_APIKEY_PRIVATE: process.env.MJ_APIKEY_PRIVATE,
        FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@vmacalculator.com',
        FROM_NAME: process.env.FROM_NAME || 'VMA Calculator',
        APP_URL: process.env.APP_URL || 'https://vma.maryamkarim.com'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'vma-proxy',
      cwd: '/home/gladius/Codes/project/scripts',
      script: 'proxy.js',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        PORT: 8080,
        API_TARGET: 'http://127.0.0.1:3001'
      }
    }
  ]
};
