#!/usr/bin/env python3
"""
ATOM Funding Rate Arbitrage Trader
执行做多ATOM合约，并监控费率反转
"""

import requests
import hmac
import hashlib
import time
import json
from urllib.parse import urlencode

API_KEY = "WLMOkNOvEsRaBgryKaEGev6naGvBWO4HLYbrAK62jiJ38xLgHKThSQak4X6ZArRZ"
SECRET = "ajxztmMdel3E0ZZulNFCYcZRv2fde6JpdGBJDGag281lxXu3jWqyGSSLycCrW5zZ"
SYMBOL = "ATOMUSDT"
QUANTITY = "5"  # 500U @ 20x leverage, 约5个ATOM
LEVERAGE = 20

BASE_URL = "https://fapi.binance.com"

def sign(params):
    """签名"""
    query = urlencode(sorted(params.items()))
    signature = hmac.new(SECRET.encode(), query.encode(), hashlib.sha256).hexdigest()
    return signature

def request(method="GET", path="/fapi/v1/balance", params=None):
    """发送请求"""
    if params is None:
        params = {}
    params['timestamp'] = int(time.time() * 1000)
    params['signature'] = sign(params)
    
    url = BASE_URL + path
    headers = {'X-MBX-APIKEY': API_KEY}
    
    if method == "GET":
        r = requests.get(url, params=params, headers=headers)
    else:
        r = requests.post(url, params=params, headers=headers)
    
    return r.json()

def get_funding_rate():
    """获取当前费率"""
    r = requests.get(f"{BASE_URL}/fapi/v1/fundingRate", 
                     params={'symbol': SYMBOL, 'limit': 1})
    data = r.json()
    return float(data[0]['fundingRate'])

def set_leverage():
    """设置杠杆"""
    params = {'symbol': SYMBOL, 'leverage': LEVERAGE}
    return request('POST', '/fapi/v1/leverage', params)

def open_long():
    """开多单"""
    params = {
        'symbol': SYMBOL,
        'side': 'BUY',
        'type': 'MARKET',
        'quantity': QUANTITY
    }
    return request('POST', '/fapi/v1/order', params)

def close_position():
    """平仓"""
    # 先获取当前持仓
    params = {'symbol': SYMBOL}
    pos = request('GET', '/fapi/v1/positionRisk', params)
    
    for p in pos:
        if float(p.get('positionAmt', 0)) != 0:
            side = 'SELL' if float(p['positionAmt']) > 0 else 'BUY'
            params = {
                'symbol': SYMBOL,
                'side': side,
                'type': 'MARKET',
                'quantity': abs(float(p['positionAmt']))
            }
            return request('POST', '/fapi/v1/order', params)
    return {'code': -1, 'msg': 'No position'}

def main():
    print(f"=== ATOM 套利交易 ===")
    
    # 1. 检查费率
    rate = get_funding_rate()
    print(f"当前Funding Rate: {rate} ({rate*100:.4f}%)")
    
    if rate >= 0:
        print("⚠️ 费率为正，不建议做多")
        exit(0)
    
    # 2. 设置杠杆
    print(f"设置杠杆: {LEVERAGE}x")
    result = set_leverage()
    print(f"设置结果: {result}")
    
    # 3. 开多单
    print(f"开多单: {QUANTITY} ATOM")
    result = open_long()
    print(f"开单结果: {result}")
    
    if 'orderId' in result:
        print("✅ 开单成功！")
        print(f"订单ID: {result['orderId']}")
    else:
        print(f"❌ 开单失败: {result}")

if __name__ == "__main__":
    main()
