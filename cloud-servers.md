# 云服务器配置信息

## 阿里云 ECS

| 项目 | 值 |
|------|-----|
| **公网 IP** | 47.120.47.39 |
| **SSH 用户** | root |
| **SSH 密码** | Zhouyou@1373918 |
| **系统** | Alibaba Cloud Linux 3 |
| **角色** | Nginx 反向代理（入口） |
| **Tailscale** | ❌ 已移除 |
| **Nginx** | 宝塔面板，监听 8081，转发到腾讯云公网 IP:8081 |
| **Docker** | ✅ 已安装 |
| **docker-compose** | ✅ v2.27.0 |
| **配置路径** | /www/server/nginx/conf/ |

---

## 腾讯云 CVM（主服务器）

| 项目 | 值 |
|------|-----|
| **公网 IP** | 175.24.184.163 |
| **SSH 用户** | root |
| **SSH 密码** | 9zqJ8Na_Y!ks4{XM |
| **系统** | TencentOS Server 4.4 (CentOS系) |
| **角色** | web3-dex 主服务器 |
| **Tailscale** | ❌ 已移除 |
| **Docker** | ✅ v28.4.0 |
| **docker-compose** | ✅ v2.30.3 |
| **Docker 镜像加速** | https://docker.mirrors.tencent.com |
| **项目路径** | /opt/web3-dex |
| **端口** | 8081 (nginx), 3001 (backend), 3000 (frontend), 5432 (postgres), 6379 (redis) |

---

## 当前架构

```
用户
  │
  ▼
阿里云 47.120.47.39:8081
  └── Nginx 反向代理（入口）
        │
        ▼
腾讯云 175.24.184.163:8081
  ├── web3-dex-nginx:80
  ├── web3-dex-frontend:3000
  ├── web3-dex-api:3001
  ├── web3-dex-postgres:5432
  └── web3-dex-redis:6379
```

**注意**：阿里云 Nginx 当前反向代理仍指向家宽 `100.71.103.91`，需更新为腾讯云公网 IP。

---

## GitHub 仓库

| 项目 | 值 |
|------|-----|
| **仓库** | https://github.com/uchiyou/web3-dex |
| **本地源码** | /root/.openclaw/workspace/web3-dex |
| **部署脚本** | /root/.openclaw/workspace/scripts/deploy-web3-dex.sh |

---

## 服务端口汇总

| 端口 | 服务 | 位置 |
|------|------|------|
| 8081 | Nginx 入口 | 阿里云 ECS |
| 8081 | web3-dex 入口 | 腾讯云 CVM |
| 3001 | Backend API | 腾讯云 CVM |
| 3000 | Frontend (Next.js) | 腾讯云 CVM |
| 5432 | PostgreSQL | 腾讯云 CVM |
| 6379 | Redis | 腾讯云 CVM |

---

## 已知问题 / 待办

- [ ] 阿里云 Nginx 反向代理目标需从家宽 IP `100.71.103.91` 改为腾讯云 `175.24.184.163`
- [ ] 腾讯云安全组需开放 8081 端口入站
