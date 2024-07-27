module.exports = {
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: [
      'talklink.online'
    ],
    proxy: {
      '/api': {
        target: 'https://talklink.online',
        changeOrigin: true,
        secure: true, // This should be true for https
      },
      '/socket.io': {
        target: 'https://talklink.online',
        ws: true,
        changeOrigin: true,
        secure: true, // This should be true for https
        onProxyReq: function (proxyReq, req, res) {
          if (req.headers['origin']) {
            proxyReq.setHeader('origin', 'https://talklink.online');
          }
        },
        pathRewrite: {
          '^/socket.io': '/socket.io', // Ensure path is correctly forwarded
        },
      }
    },
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    client: {
      webSocketURL: 'wss://talklink.online/socket.io',
    },
  },
  configureWebpack: {
    devtool: 'source-map'
  }
};
