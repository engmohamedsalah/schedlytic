const path = require('path');

module.exports = {
    apps: [
      {
        name: 'schedlytic',
        script: path.resolve(__dirname, 'dist/main.js'),
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '2G',
        env: {
          NODE_ENV: 'production',
          PORT: 3016,
        },
      },
    ],
  };