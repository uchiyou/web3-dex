#!/usr/bin/env python3
"""
全币种费率套利扫描 (对冲版)
只扫描同时有合约和现货的交易对
每小时扫描，发现高收益机会时记录
"""
import requests
import time
import json

BASE_F = "https://fapi.binance.com"  # 合约
BASE_S = "https://api.binance.com"   # 现货
CAPITAL = 500
LEVERAGE = 3
LOG_FILE = "/root/.openclaw/workspace/memory/arbitrage-scan.log"
DATA_FILE = "/root/.openclaw/workspace/memory/funding-rates.json"

def log(msg):
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}")

def get_symbols():
    """获取同时支持合约和现货的交易对"""
    # 合约
    r = requests.get(f"{BASE_F}/fapi/v1/exchangeInfo", timeout=10)
    futures = set(x['symbol'] for x in r.json()['symbols'] 
                 if x['status'] == 'TRADING' and x['symbol'].endswith('USDT'))
    
    # 现货
    r = requests.get(f"{BASE_S}/api/v3/exchangeInfo", timeout=10)
    spots = set(x['symbol'] for x in r.json()['symbols'] 
               if x['status'] == 'TRADING' and x['symbol'].endswith('USDT'))
    
    # 交集 = 两者都有
    both = futures & spots
    log(f"合约: {len(futures)}, 现货: {len(spots)}, 可对冲: {len(both)}")
    return list(both)

def get_rates(symbols):
    """获取费率"""
    rates = []
    for sym in symbols:
        try:
            r = requests.get(f"{BASE_F}/fapi/v1/fundingRate", 
                           params={'symbol': sym, 'limit': 1}, timeout=3)
            if r.status_code == 200 and r.json():
                rate = float(r.json()[0]['fundingRate'])
                rates.append({'symbol': sym, 'rate': rate})
        except:
            pass
    return rates

def calc_profit(rate, leverage=LEVERAGE):
    """计算收益 (对冲版 - 包含现货成本)"""
    notional = CAPITAL * leverage
    
    # 费率收益 (每月90次，每8小时一次)
    funding_monthly = notional * rate * 90
    
    # 成本计算
    # 合约：开仓(taker) + 平仓(maker)
    future_fee = notional * (0.0004 + 0.0002)
    # 现货：买入(taker) + 卖出(taker) - 对冲需要双向
    spot_fee = notional * (0.001 + 0.001)
    total_fee = future_fee + spot_fee
    
    return funding_monthly - total_fee

def main():
    log("开始扫描(对冲模式)...")
    symbols = get_symbols()
    rates = get_rates(symbols)
    
    # 排序
    rates.sort(key=lambda x: x['rate'], reverse=True)
    
    # 记录
    with open(DATA_FILE, 'w') as f:
        json.dump(rates, f)
    
    log(f"扫描完成，共{len(rates)}个可对冲币种")
    
    # 正费率Top5 (做空)
    log("\n🔥 做空机会 (正费率):")
    for r in rates[:5]:
        profit = calc_profit(r['rate'])
        roi = profit / CAPITAL * 100
        flag = "✅" if roi > 0 else "❌"
        log(f"  {r['symbol']} 费率+{r['rate']*100:.3f}% 月化{roi:.1f}% {flag}")
    
    # 负费率Top5 (做多)
    log("\n💰 做多机会 (负费率):")
    for r in rates[-5:][::-1]:
        profit = calc_profit(r['rate'])
        roi = profit / CAPITAL * 100
        flag = "✅" if roi > 0 else "❌"
        log(f"  {r['symbol']} 费率{r['rate']*100:.3f}% 月化{roi:.1f}% {flag}")
    
    # 检查高收益
    opportunities = []
    for r in rates:
        profit = calc_profit(r['rate'])
        roi = profit / CAPITAL * 100
        if roi > 3:
            opportunities.append({**r, 'profit': profit, 'roi': roi})
    
    if opportunities:
        log(f"\n⚠️ 高收益机会(月化>3%):")
        for o in opportunities:
            direction = "做空" if o['rate'] > 0 else "做多"
            log(f"  {o['symbol']} {direction} 月化{o['roi']:.1f}%")

if __name__ == "__main__":
    main()
