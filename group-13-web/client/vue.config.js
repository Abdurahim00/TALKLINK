module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Your backend server
        changeOrigin: true,
        pathRewrite: { '^/api': '' }, // Remove /api prefix when forwarding to backend
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true, // Enable WebSocket proxying
        changeOrigin: true,
      }
    }
  }
}
