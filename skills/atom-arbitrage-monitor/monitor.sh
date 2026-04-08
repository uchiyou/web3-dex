#!/bin/bash
# ATOM 资金费率套利监控脚本
# 每 8 小时检查一次，费率反转则自动平仓

API_KEY="WLMOkNOvEsRaBgryKaEGev6naGvBWO4HLYbrAK62jiJ38xLgHKThSQak4X6ZArRZ"
SECRET="ajxztmMdel3E0ZZulNFCYcZRv2fde6JpdGBJDGag281lxXu3jWqyGSSLycCrW5zZ"
SYMBOL="ATOMUSDT"
THRESHOLD="0.0001"  # 费率反转阈值（正费率超过 0.01% 则平仓）
LOG_FILE="/root/.openclaw/workspace/data/atom-arbitrage/log.jsonl"

# 创建日志目录
mkdir -p $(dirname $LOG_FILE)

# 获取当前时间
TIMESTAMP=$(date +%s%3N)
DATETIME=$(date '+%Y-%m-%d %H:%M:%S')

# 获取资金费率
FUNDING_RESPONSE=$(curl -s "https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${SYMBOL}")
FUNDING_RATE=$(echo $FUNDING_RESPONSE | jq -r '.lastFundingRate')

# 记录日志
echo "{\"datetime\":\"${DATETIME}\",\"fundingRate\":${FUNDING_RATE}}" >> $LOG_FILE

# 判断是否反转
IS_POSITIVE=$(echo "$FUNDING_RATE > $THRESHOLD" | bc -l)

if [ "$IS_POSITIVE" -eq 1 ]; then
    echo "⚠️  费率反转！当前费率：${FUNDING_RATE}（正数），执行平仓..."
    
    # 获取当前持仓数量
    POSITION_RESPONSE=$(curl -s "https://fapi.binance.com/fapi/v2/positionRisk?timestamp=${TIMESTAMP}&signature=$(echo -n "timestamp=${TIMESTAMP}" | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)" -H "X-MBX-APIKEY: ${API_KEY}")
    POSITION_AMT=$(echo $POSITION_RESPONSE | jq -r '.[] | select(.symbol=="ATOMUSDT" and .positionSide=="SHORT") | .positionAmt')
    
    # 取绝对值
    QUANTITY=$(echo $POSITION_AMT | sed 's/-//')
    
    if (( $(echo "$QUANTITY > 0" | bc -l) )); then
        echo "📊 当前持仓：${QUANTITY} ATOM 空单"
        
        # 平仓：买入平空
        QUERY="symbol=${SYMBOL}&side=BUY&type=MARKET&positionSide=SHORT&quantity=${QUANTITY}&timestamp=${TIMESTAMP}"
        SIGNATURE=$(echo -n "$QUERY" | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)
        CLOSE_RESPONSE=$(curl -s -X POST "https://fapi.binance.com/fapi/v1/order?${QUERY}&signature=${SIGNATURE}" -H "X-MBX-APIKEY: ${API_KEY}")
        
        echo "✅ 平仓订单提交：${CLOSE_RESPONSE}"
        
        # 发送通知（如果有 Telegram 配置）
        # openclaw message send --target @me --message "ATOM 套利平仓：费率反转至 ${FUNDING_RATE}"
    else
        echo "ℹ️  无持仓，跳过平仓"
    fi
else
    echo "✅ 费率正常：${FUNDING_RATE}（负数），继续持有"
    echo "💰 预计每 8 小时收益：$(echo "250 * $FUNDING_RATE * -1" | bc -l) USDT"
fi
