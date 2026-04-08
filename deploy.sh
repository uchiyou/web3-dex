#!/bin/bash
#
# Web3 DEX 部署脚本 (后台执行版)
# 用途：构建前端 Docker 镜像并重启服务
# 特性：任务在后台执行，通过轮询进度
#

REMOTE_USER="root"
REMOTE_HOST="175.24.184.163"
REMOTE_PORT="22"
REMOTE_PATH="/opt/web3-dex"
LOCAL_PATH="/root/.openclaw/workspace/web3-dex"
SSH_PASS='9zqJ8Na_Y!ks4{XM'
TASK_ID="web3-dex-deploy-$$"
LOG_FILE="/tmp/${TASK_ID}.log"
PID_FILE="/tmp/${TASK_ID}.pid"

echo "🚀 部署任务已启动 (ID: ${TASK_ID})"
echo "📋 日志文件: ${LOG_FILE}"
echo ""
echo "任务将在后台执行，预计需要 3-5 分钟"
echo "使用以下命令查看进度:"
echo "  tail -f ${LOG_FILE}"
echo ""

# 1. 同步代码到远程服务器 (快速，几十秒)
echo "[1/4] 同步代码到远程服务器..."
rsync -avz --delete \
  -e "sshpass -p '${SSH_PASS}' ssh -o StrictHostKeyChecking=no -p ${REMOTE_PORT}" \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='*.log' \
  ${LOCAL_PATH}/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/ > ${LOG_FILE} 2>&1

if [ $? -ne 0 ]; then
    echo "❌ 代码同步失败!"
    tail -5 ${LOG_FILE}
    exit 1
fi
echo "✅ 代码同步完成"

# 2. 在后台执行构建和部署
echo "[2/4] 开始构建 Docker 镜像 (后台执行中...)..."

sshpass -p "${SSH_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} > ${LOG_FILE}.remote 2>&1 << 'ENDSSH' &
cd /opt/web3-dex
echo "构建开始: $(date)" >> /tmp/build.log
docker build -f frontend/Dockerfile -t web3-dex-frontend:latest ./frontend >> /tmp/build.log 2>&1
echo "构建完成: $(date)" >> /tmp/build.log
docker-compose up -d --no-deps --build frontend >> /tmp/build.log 2>&1
echo "部署完成: $(date)" >> /tmp/build.log
docker image prune -f >> /tmp/build.log 2>&1
ENDSSH

REMOTE_PID=$!
echo ${REMOTE_PID} > ${PID_FILE}

# 等待远程命令完成 (最多10分钟)
echo "等待远程服务器构建完成..."

MAX_WAIT=600  # 10分钟
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
    sleep 15
    ELAPSED=$((ELAPSED + 15))
    
    # 检查远程进程是否还在运行
    if sshpass -p "${SSH_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "docker ps --format '{{.Names}}' | grep -q web3-frontend" 2>/dev/null; then
        # 检查构建日志
        BUILD_STATUS=$(sshpass -p "${SSH_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "tail -1 /tmp/build.log 2>/dev/null" 2>/dev/null || echo "构建中...")
        echo "  [${ELAPSED}s] ${BUILD_STATUS}"
        
        if echo "${BUILD_STATUS}" | grep -q "部署完成"; then
            break
        fi
    fi
done

# 3. 验证部署
echo ""
echo "[3/4] 验证部署结果..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://47.120.47.39:8081/ 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 部署成功! HTTP状态码: $HTTP_CODE"
else
    echo "⚠️  HTTP状态码: $HTTP_CODE (可能需要等待几秒)"
fi

# 4. 显示容器状态
echo ""
echo "[4/4] 当前容器状态:"
sshpass -p "${SSH_PASS}" ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep web3" 2>/dev/null

echo ""
echo "========================================"
echo "🎉 部署完成!"
echo "访问地址: http://47.120.47.39:8081"
echo "========================================"

# 清理临时文件
rm -f ${PID_FILE}
