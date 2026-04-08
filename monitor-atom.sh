#!/bin/bash
# ATOM Funding Rate Arbitrage Monitor
# 检查ATOM费率，如果反转则平仓

SYMBOL="ATOMUSDT"
API_URL="https://fapi.binance.com"
SECRET="ajxztmMdel3E0ZZulNFCYcZRv2fde6JpdGBJDGag281lxXu3jWqyGSSLycCrW5zZ"
API_KEY="WLMOkNOvEsRaBgryKaEGev6naGvBWO4HLYbrAK62jiJ38xLgHKThSQak4X6ZArRZ"

LOG_FILE="/root/.openclaw/workspace/memory/atom-arbitrage.log"

echo "==== $(date) ATOM套利检查 ====" >> $LOG_FILE

# 获取当前费率
FUNDING=$(curl -s --proxy "" -H "User-Agent: Mozilla/5.0" "$API_URL/fapi/v1/fundingRate?symbol=$SYMBOL&limit=1")
RATE=$(echo $FUNDING | grep -o '"fundingRate":"[^"]*"' | cut -d'"' -f4)

echo "当前费率: $RATE" >> $LOG_FILE

# 检查费率是否反转（从负变正或接近零）
if (( $(echo "$RATE > -0.0001" | bc -l) )); then
    echo "⚠️ 费率接近零或正，可能反转，平仓..." >> $LOG_FILE
    # 这里添加平仓逻辑（需要获取position然后平仓）
    # 暂时记录日志提醒
else
    echo "✅ 费率正常（负），继续持仓" >> $LOG_FILE
fi

echo "----" >> $LOG_FILE
