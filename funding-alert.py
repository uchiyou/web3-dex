#!/usr/bin/env python3
"""
ATOM 费率监控提醒
当费率回升到可套利水平时提醒
"""
import requests
import time

SYMBOL = "ATOMUSDT"
BASE = "https://fapi.binance.com"
THRESHOLD = 0.0003  # 费率超过0.03%时提醒
LOG_FILE = "/root/.openclaw/workspace/memory/funding-alert.log"

def log(msg):
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}")

def check_funding():
    r = requests.get(f"{BASE}/fapi/v1/fundingRate", params={'symbol': SYMBOL, 'limit': 1})
    rate = float(r.json()[0]['fundingRate'])
    return rate

def main():
    rate = check_funding()
    log(f"ATOM费率: {rate*100:.4f}%")
    
    if abs(rate) >= THRESHOLD:
        log(f"⚠️ 费率达标！({rate*100:.4f}%) 可考虑入场")
    else:
        log(f"费率较低，等待回升...")
    
    # 记录
    with open(LOG_FILE, "a") as f:
        f.write(f"{time.strftime('%Y-%m-%d %H:%M')},{rate*100:.4f}%\n")

if __name__ == "__main__":
    main()
