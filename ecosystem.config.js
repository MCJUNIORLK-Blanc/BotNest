module.exports = {
  apps: [{
    name: 'botcommander',
    script: './dist/index.js',
    cwd: '/opt/botcommander',
    user: 'botcommander',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 5000,
    max_restarts: 10,
    min_uptime: '10s',
    
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      BOTS_DIR: '/opt/botcommander/bots',
      LOG_LEVEL: 'info'
    },
    
    env_development: {
      NODE_ENV: 'development',
      PORT: 5000,
      BOTS_DIR: '/opt/botcommander/bots',
      LOG_LEVEL: 'debug'
    },
    
    error_file: '/var/log/botcommander/error.log',
    out_file: '/var/log/botcommander/access.log',
    log_file: '/var/log/botcommander/combined.log',
    time: true,
    
    // Log rotation
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    
    // Advanced PM2 features
    source_map_support: true,
    instance_var: 'INSTANCE_ID',
    
    // Health monitoring
    min_uptime: '10s',
    max_restarts: 10,
    
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 8000,
    
    // Environment-specific settings
    node_args: '--max-old-space-size=1024'
  }],
  
  deploy: {
    production: {
      user: 'botcommander',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'https://github.com/yourusername/botcommander.git',
      path: '/opt/botcommander',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
