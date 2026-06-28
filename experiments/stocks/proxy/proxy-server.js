const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();

// 启用CORS
app.use(cors());

// 静态文件服务
app.use(express.static(path.join(__dirname, '..', 'ui')));

// 代理API请求
app.use('/api', createProxyMiddleware({
  target: 'http://stock.dyqvideo.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // 保持路径不变
  },
  onError: (err, req, res) => {
    console.error('代理错误:', err);
    res.status(500).json({ success: false, message: '代理服务器错误' });
  }
}));

// 根路径重定向到股票页面
app.get('/', (req, res) => {
  res.redirect('/myStock.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
  console.log(`股票页面: http://localhost:${PORT}/myStock.html`);
});
