#!/bin/bash
#
# ECS 端 Tailscale + Nginx 反向代理部署脚本
# 
# 功能：
#   1. 安装 Tailscale（无公网 IP 时做 VPN 入口）
#   2. 安装 Nginx（反向代理到家宽机器）
#   3. 配置安全组/iptables 开放端口
#
# 用法：bash setup-ecs.sh <TAILSCALE_AUTH_KEY>
#

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

TAILSCALE_AUTH_KEY="${1:-}"
EXPOSED_PORT=8081
HOME_MACHINE_TAILSCALE_IP="${2:-100.64.100.100}"  # 默认家宽 Tailscale IP

# ============================================================
# 步骤 1: 检查并安装 Tailscale
# ============================================================
log "==== 1/5 安装 Tailscale ===="

if command -v tailscale &>/dev/null; then
    log "Tailscale 已安装: $(tailscale version 2>/dev/null | head -1)"
else
    log "安装 Tailscale..."
    curl -fsSL https://tailscale.com/install.sh | sh || err "Tailscale 安装失败"
fi

# ============================================================
# 步骤 2: 连接 Tailscale 网络
# ============================================================
log "==== 2/5 连接 Tailscale 网络 ===="

# 启动 Tailscale（如果是 fresh 系统）
if ! tailscale status &>/dev/null; then
    if [ -n "$TAILSCALE_AUTH_KEY" ]; then
        log "使用 auth key 连接 Tailscale..."
        tailscale up --accept-routes --authkey="$TAILSCALE_AUTH_KEY" || err "Tailscale 连接失败"
    else
        log "无 auth key，请手动连接:"
        log "  tailscale up --accept-routes"
        log "  然后再次运行本脚本，传入第二个参数（家宽机器 Tailscale IP）"
        exit 1
    fi
fi

TAILSCALE_IP=$(tailscale ip -4 2>/dev/null | head -1)
log "ECS Tailscale IP: ${TAILSCALE_IP}"
log "请确认家宽机器的 Tailscale IP（例如: 100.64.100.100）"
log "并在运行本脚本时作为第二个参数传入"
log "  bash setup-ecs.sh <AUTH_KEY> 100.64.100.100"

# ============================================================
# 步骤 3: 安装 Nginx
# ============================================================
log "==== 3/5 安装 Nginx ===="

if command -v nginx &>/dev/null; then
    log "Nginx 已安装"
else
    if command -v apt-get &>/dev/null; then
        apt-get update && apt-get install -y nginx || err "Nginx 安装失败"
    elif command -v yum &>/dev/null; then
        yum install -y nginx || err "Nginx 安装失败"
    elif command -v apk &>/dev/null; then
        apk add nginx || err "Nginx 安装失败"
    fi
fi

# ============================================================
# 步骤 4: 配置 Nginx 反向代理到家宽
# ============================================================
log "==== 4/5 配置 Nginx 反向代理 ===="

# 获取家宽 Tailscale IP（优先使用传入参数）
TARGET_IP="${HOME_MACHINE_TAILSCALE_IP}"
[ -z "$TARGET_IP" ] && TARGET_IP="100.64.100.100"

log "反向代理目标: ${TARGET_IP}:${EXPOSED_PORT}"

cat > /etc/nginx/nginx.conf << EOF
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    access_log off;
    error_log /var/log/nginx/error.log warn;

    gzip on;
    gzip_vary on;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml image/svg+xml;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=general:10m rate=50r/s;

    # 家宽机器 upstream（通过 Tailscale VPN）
    upstream home_dex {
        server ${TARGET_IP}:${EXPOSED_PORT};
        keepalive 64;
    }

    server {
        listen 80;
        server_name localhost;

        # 静态资源 - 强缓存
        location /_next/static/ {
            proxy_pass http://home_dex;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            add_header Cache-Control "public, max-age=31536000, immutable";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        }

        # Next.js 数据
        location /_next/data/ {
            proxy_pass http://home_dex;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            add_header Cache-Control "public, max-age=31536000";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        }

        # API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://home_dex;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_buffering on;
            proxy_cache_valid 200 10s;
        }

        # WebSocket（Socket.io）
        location /socket.io/ {
            proxy_pass http://home_dex;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        }

        # 其他请求 - 全部转发到家宽
        location / {
            proxy_pass http://home_dex;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_buffering on;
            proxy_buffer_size 8k;
            proxy_buffers 8 8k;
        }
    }
}
EOF

# 测试并启动 Nginx
nginx -t && systemctl enable nginx --now 2>/dev/null || nginx -t && nginx

# ============================================================
# 步骤 5: 开放防火墙/安全组端口
# ============================================================
log "==== 5/5 开放端口 ===="

# iptables（主机防火墙）
iptables -I INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
iptables -I INPUT -p tcp --dport ${EXPOSED_PORT} -j ACCEPT 2>/dev/null || true

# 保存 iptables 规则
if command -v apt-get &>/dev/null; then
    apt-get install -y iptables-persistent 2>/dev/null || true
    netfilter-persistent save 2>/dev/null || true
fi

log ""
log "========== ECS 部署完成 =========="
log ""
log "ECS Tailscale IP: ${TAILSCALE_IP}"
log "反向代理指向: ${TARGET_IP}:${EXPOSED_PORT}"
log "Nginx: http://0.0.0.0:80 -> ${TARGET_IP}:${EXPOSED_PORT}"
log ""
log "✅ 请确保:"
log "  1. 阿里云安全组开放了 TCP 80 端口入站"
log "  2. 家宽机器已运行 Tailscale 且 IP 为 ${TARGET_IP}"
log "  3. 家宽机器已运行 docker-compose（见 setup-home.sh）"
log ""
log "下一步：在家宽机器上运行 setup-home.sh"
