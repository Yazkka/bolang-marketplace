module.exports = {
  apps: [
    {
      name: 'bolang-marketplace',
      script: '.next/standalone/server.js',
      cwd: '/srv/data/gtnic/bolang-marketplace',
      env: {
        PORT: 3001,
        NODE_ENV: 'production'
      }
    }
  ]
}
