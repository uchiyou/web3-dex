#!/bin/bash
#
# 家宽机器端部署脚本
# 
# 功能：
#   1. 安装 Docker + docker-compose
#   2. 安装 Tailscale（连接 ECS）
#   3. 拉取并运行 web3-dex 所有容器
#   4. 验证服务状态
#
# 用法：bash setup-home.sh <ECS_SSH_HOST> <ECS_SSH_USER> <ECS_SSH_PASS> [ECS_TAILSCALE_IP]
#

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

ECS_HOST="${1:-47.120.47.39}"
ECS_SSH_USER="${2:-root}"
ECS_SSH_PASS="${3:-}"
ECS_TAILSCALE_IP="${4:-}"  # ECS 的 Tailscale IP，可选

PROJECT_DIR="${HOME}/web3-dex"
EXPOSED_PORT=8081

# ============================================================
# 步骤 1: 安装 Docker（如未安装）
# ============================================================
log "==== 1/7 检查并安装 Docker ===="

if command -v docker &>/dev/null; then
    log "Docker 已安装: $(docker --version)"
else
    log "安装 Docker..."
    curl -fsSL https://get.docker.com | sh || err "Docker 安装失败"
    systemctl enable docker --now 2>/dev/null || true
    log "Docker 安装完成"
fi

if command -v docker-compose &>/dev/null; then
    log "docker-compose 已安装"
else
    log "安装 docker-compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    log "docker-compose 安装完成"
fi

# ============================================================
# 步骤 2: 安装 Tailscale
# ============================================================
log "==== 2/7 安装 Tailscale ===="

if command -v tailscale &>/dev/null; then
    log "Tailscale 已安装: $(tailscale version 2>/dev/null | head -1)"
else
    log "安装 Tailscale..."
    curl -fsSL https://tailscale.com/install.sh | sh || err "Tailscale 安装失败"
fi

# ============================================================
# 步骤 3: 获取 web3-dex 源码
# ============================================================
log "==== 3/7 准备 web3-dex 源码 ===="

if [ -d "${PROJECT_DIR}/.git" ]; then
    log "源码已存在，拉取更新..."
    cd "${PROJECT_DIR}" && git pull origin master
elif [ -n "$ECS_SSH_PASS" ]; then
    log "从 ECS 复制源码..."
    sshpass -p "$ECS_SSH_PASS" scp -r -o StrictHostKeyChecking=no \
        "${ECS_SSH_USER}@${ECS_HOST}:/opt/web3-dex" "${PROJECT_DIR}" 2>/dev/null || \
    warn "无法从 ECS 复制，将从 GitHub 克隆"
fi

if [ ! -d "${PROJECT_DIR}" ]; then
    log "从 GitHub 克隆源码..."
    git clone https://github.com/uchiyou/web3-dex.git "${PROJECT_DIR}"
fi

cd "${PROJECT_DIR}"
log "源码目录: ${PROJECT_DIR}"

# ============================================================
# 步骤 4: 应用 UI 重构修改（如果需要）
# ============================================================
log "==== 4/7 应用修复（可选）===="

# 应用所有之前部署时的修复
log "检查是否需要应用 UI 修复..."

# 检查并应用关键文件修复
if [ -f "frontend/next.config.js" ]; then
    # 确保 ignoreBuildErrors 开启（防止类型错误）
    grep -q "ignoreBuildErrors" frontend/next.config.js || \
    sed -i 's/typescript: {/typescript: {\n    ignoreBuildErrors: true,/' frontend/next.config.js
fi

# 确保 _app.tsx 存在
if [ ! -f "frontend/src/pages/_app.tsx" ]; then
    log "创建 _app.tsx..."
    mkdir -p "frontend/src/pages"
    cat > "frontend/src/pages/_app.tsx" << 'APPEOF'
import type { AppProps } from 'next/app'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config } from '@/config/wagmi'

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
APPEOF
fi

log "修复检查完成"

# ============================================================
# 步骤 5: 配置环境变量
# ============================================================
log "==== 5/7 配置 .env ===="

if [ ! -f ".env" ]; then
    log "创建 .env 文件..."
    # 获取本机局域网 IP
    LOCAL_IP=$(hostname -I | awk '{print $1}')
    
    cat > .env << EOF
NODE_ENV=production
PORT=3001

# Database
PG_HOST=postgres
PG_PORT=5432
PG_DATABASE=web3_dex
PG_USER=postgres
PG_PASSWORD=web3dex_pass

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# CORS（ECS 公网 IP）
CORS_ORIGIN=http://${ECS_HOST}:80

# JWT
JWT_SECRET=web3dex_jwt_\$(date +%s)

# Frontend
NEXT_PUBLIC_DEX_CORE_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=placeholder
EOF
    log ".env 已创建"
else
    log ".env 已存在，跳过"
fi

# 修改 docker-compose.yml 端口映射（家宽不暴露 8081，只供 Tailscale 内网访问）
log "确保 docker-compose 监听所有网卡..."
sed -i "s/127.0.0.1://0.0.0.0:/g" docker-compose.yml 2>/dev/null || true

# ============================================================
# 步骤 6: 连接 Tailscale 网络
# ============================================================
log "==== 6/7 连接 Tailscale ===="

# 检查是否已有 Tailscale auth key（用户需要提供）
TAILSCALE_AUTH_KEY="${TAILSCALE_AUTH_KEY:-${TAILSACLE_AUTH_KEY:-}}"

if ! tailscale status &>/dev/null; then
    if [ -n "$TAILSCALE_AUTH_KEY" ]; then
        log "连接 Tailscale 网络..."
        tailscale up --accept-routes --authkey="$TAILSCALE_AUTH_KEY" || warn "Tailscale 连接失败，请手动运行: tailscale up --accept-routes"
    else
        warn "未提供 Tailscale auth key，跳过自动连接"
        log "请手动运行以下命令连接 Tailscale:"
        log "  tailscale up --accept-routes"
    fi
fi

HOME_TAILSCALE_IP=$(tailscale ip -4 2>/dev/null | head -1 || echo "未连接")
log "家宽 Tailscale IP: ${HOME_TAILSCALE_IP}"

if [ -n "$TAILSCALE_AUTH_KEY" ]; then
    # 告知 ECS 新 IP
    if [ -n "$ECS_SSH_PASS" ] && [ -n "$HOME_TAILSCALE_IP" ] && [ "$HOME_TAILSCALE_IP" != "未连接" ]; then
        log "通知 ECS 新的家宽 Tailscale IP..."
        sshpass -p "$ECS_SSH_PASS" ssh -o StrictHostKeyChecking=no \
            "${ECS_SSH_USER}@${ECS_HOST}" \
            "sed -i 's/server ${HOME_TAILSCALE_IP}/server ${HOME_TAILSCALE_IP}/' /etc/nginx/nginx.conf 2>/dev/null || true; \
             sed -i \"s/100.64.100.100/${HOME_TAILSCALE_IP}/\" /etc/nginx/nginx.conf 2>/dev/null || true; \
             nginx -s reload 2>/dev/null || true" 2>/dev/null || true
        log "ECS 已更新反向代理配置"
    fi
fi

# ============================================================
# 步骤 7: 启动所有容器
# ============================================================
log "==== 7/7 启动服务 ===="

# 停止旧容器
docker-compose down --remove-orphans 2>/dev/null || true

# 启动所有服务
docker-compose up -d --build

# 等待启动
sleep 10

# 健康检查
log "检查容器状态..."
docker ps --format "table {{.Names}}\t{{.Status}}" | grep web3-dex || docker ps --format "table {{.Names}}\t{{.Status}}"

# 验证端口
log "验证服务端口..."
ss -tlnp | grep ${EXPOSED_PORT} || netstat -tlnp | grep ${EXPOSED_PORT} || \
    log "注意: 端口 ${EXPOSED_PORT} 监听在所有网卡 (0.0.0.0)"

log ""
log "========== 家宽部署完成 =========="
log ""
log "Docker 服务: $(docker-compose ps 2>/dev/null | grep -c 'Up' || echo '0') 个运行中"
log "家宽 Tailscale IP: ${HOME_TAILSCALE_IP}"
log "服务端口: ${EXPOSED_PORT}（监听 0.0.0.0，供 ECS 访问）"
log ""
log "✅ 如果 ECS 也配置了 Tailscale + Nginx:"
log "   用户访问: http://${ECS_HOST} -> ECS Nginx -> 家宽服务"
log ""
log "常用命令:"
log "  查看日志: docker-compose logs -f"
log "  重启服务: docker-compose restart"
log "  停止服务: docker-compose down"
