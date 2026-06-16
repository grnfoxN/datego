module.exports = {
  apps: [{
    name: 'datego-frontend',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000',
    cwd: '/var/www/datego/frontend',
    env: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'http://176.123.164.182',
    },
  }],
}
