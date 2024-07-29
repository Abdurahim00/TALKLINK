module.exports = {
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: [
      'talklink.online',
      'localhost'
    ],
    proxy: {
      '/api': {
        target: 'https://talklink.online',
        changeOrigin: true,
        secure: true,
      },
      '/socket.io': {
        target: 'https://talklink.online',
        ws: true,
        changeOrigin: true,
        secure: true,
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
