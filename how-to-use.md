# 使用与部署

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:3000/docs/gpt-image-2

## 编辑

| 操作 | 文件 |
| --- | --- |
| 改正文 | `content/docs/*.mdx` |
| 改侧栏 | `content/docs/meta.json` |
| 改品牌/API 地址 | `lib/site.config.ts` |

## 构建

```bash
npm run build
npm start    # 默认 http://localhost:3000
```

## 部署

### 方式一：Vercel（推荐）

1. 将代码推送到 GitHub
2. 在 [vercel.com](https://vercel.com) 导入仓库
3. 框架自动识别为 Next.js，无需额外配置
4. 可选环境变量：`NEXT_PUBLIC_SITE_URL=https://你的域名`

### 方式二：自有服务器（Node）

```bash
npm install
npm run build
npm start
```

用 Nginx 反代到 `127.0.0.1:3000`，或用 PM2 守护进程：

```bash
pm2 start npm --name apidoc -- start
```

### 方式三：Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t apidoc .
docker run -p 3000:3000 -e NEXT_PUBLIC_SITE_URL=https://你的域名 apidoc
```

## 注意

- 项目含 `/api/search` 搜索接口，需 Node 运行时，不能直接当纯静态文件托管
- 生产环境建议设置 `NEXT_PUBLIC_SITE_URL`，用于 SEO 与 Open Graph 图片地址
