#!/usr/bin/env python3
"""
ATOM Funding Rate 监控脚本
每8小时执行，费率反转时自动平仓
"""
import requests
import hmac
import hashlib
import time
from urllib.parse import urlencode
import json
import os

API_KEY = "WLMOkNOvEsRaBgryKaEGev6naGvBWO4HLYbrAK62jiJ38xLgHKThSQak4X6ZArRZ"
SECRET = "ajxztmMdel3E0ZZulNFCYcZRv2fde6JpdGBJDGag281lxXu3jWqyGSSLycCrW5zZ"
SYMBOL = "ATOMUSDT"
BASE = "https://fapi.binance.com"
LOG_FILE = "/root/.openclaw/workspace/memory/atom-arbitrage.log"

def log(msg):
    """写入日志"""
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a") as f:
        f.write(f"[{ts}] {msg}\n")
    print(f"[{ts}] {msg}")

def sign(params_str):
    return hmac.new(SECRET.encode(), params_str.encode(), hashlib.sha256).hexdigest()

def get_funding_rate():
    """获取当前费率"""
    r = requests.get(f"{BASE}/fapi/v1/fundingRate", 
                     params={'symbol': SYMBOL, 'limit': 1})
    return float(r.json()[0]['fundingRate'])

def get_position():
    """获取当前持仓"""
    headers = {'X-MBX-APIKEY': API_KEY}
    for i in range(3):
        try:
            ts = int(time.time() * 1000)
            params = f'timestamp={ts}'
            sig = sign(params)
            r = requests.get(f"{BASE}/fapi/v2/account", 
                            params=f'{params}&signature={sig}', headers=headers, timeout=10)
            if r.status_code == 200:
                data = r.json()
                for p in data.get('positions', []):
                    if p.get('symbol') == SYMBOL and float(p.get('positionAmt', 0)) != 0:
                        return p
                return None
        except Exception as e:
            log(f"获取持仓失败，重试 {i+1}/3: {e}")
            time.sleep(2)
    return None

def close_position(positionAmt, positionSide):
    """平仓"""
    headers = {'X-MBX-APIKEY': API_KEY}
    side = 'SELL' if float(positionAmt) > 0 else 'BUY'
    ts = int(time.time() * 1000)
    params = f"symbol={SYMBOL}&side={side}&type=MARKET&quantity={abs(float(positionAmt))}&positionSide={positionSide}&timestamp={ts}"
    sig = sign(params)
    r = requests.post(f"{BASE}/fapi/v1/order", params=f'{params}&signature={sig}', headers=headers)
    return r.json()

def main():
    log("=" * 30)
    log("开始检查ATOM套利状态")
    
    # 1. 检查费率
    rate = get_funding_rate()
    log(f"当前Funding Rate: {rate} ({rate*100:.4f}%)")
    
    # 2. 检查持仓
    pos = get_position()
    if not pos:
        log("⚠️ 无持仓，套利结束")
        return
    
    pos_amt = float(pos['positionAmt'])
    pos_side = pos['positionSide']
    entry_price = float(pos['entryPrice'])
    log(f"持仓: {pos_amt} {SYMBOL}, 方向: {pos_side}, 开仓价: {entry_price}")
    
    # 3. 判断是否需要平仓
    should_close = False
    reason = ""
    
    if pos_side == "LONG" and rate >= -0.0001:
        # 多单，费率转正或接近零
        should_close = True
        reason = f"费率反转({rate*100:.4f}%)，从负变正或接近零"
    elif pos_side == "SHORT" and rate <= 0.0001:
        # 空单，费率转负
        should_close = True
        reason = f"费率反转({rate*100:.4f}%)，从正变负或接近零"
    
    if should_close:
        log(f"⚠️ 触发平仓条件: {reason}")
        result = close_position(pos_amt, pos_side)
        log(f"平仓结果: {result}")
    else:
        log(f"✅ 费率正常，继续持仓")
    
    log("-" * 30)

if __name__ == "__main__":
    main()
