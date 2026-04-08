#!/usr/bin/env python3
"""
Polymarket 订单簿套利扫描器
Order Book Arbitrage Scanner

原理：
- 获取订单簿的最佳买价(bid)和卖价(ask)
- 计算买入价差利润: ask_price - bid_price
- 扣除交易手续费后仍有盈利则为机会

手续费估算：
- Maker Fee: 0%
- Taker Fee: 0.05% (根据Polymarket文档)
- 滑点估算: 0.5% (保守估计)
"""

import json
import requests
import sys
from typing import Dict, List, Optional

# 配置
API_URL = "https://clob.polymarket.com"
GAMMA_API = "https://gamma-api.polymarket.com"

# 手续费参数
TAKER_FEE = 0.0005  # 0.05%
SLIPPAGE = 0.005     # 0.5% 滑点估算
MIN_PROFIT = 0.001   # 最小利润阈值 ($1)
MIN_VOLUME = 1000    # 最小交易量


def get_markets(limit: int = 50) -> List[Dict]:
    """获取活跃市场"""
    url = f"{GAMMA_API}/markets"
    params = {
        "closed": "false",
        "limit": limit
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        return resp.json()
    except Exception as e:
        print(f"Error fetching markets: {e}")
        return []


def get_order_book(token_id: str) -> Optional[Dict]:
    """获取订单簿"""
    url = f"{API_URL}/book"
    params = {"token_id": token_id}
    try:
        resp = requests.get(url, params=params, timeout=10)
        return resp.json()
    except Exception as e:
        return None


def calculate_arb_profit(best_bid: float, best_ask: float, size: float) -> Dict:
    """
    计算套利利润
    
    策略：同时以bid买入，以ask卖出（实际是反向）
    利润 = (bid - ask) * size - 手续费 - 滑点
    """
    if best_bid <= 0 or best_ask <= 0 or size <= 0:
        return {"profitable": False, "reason": "invalid prices"}
    
    # 买入成本 (taker fee + slippage)
    buy_cost = best_ask * size * (1 + TAKER_FEE + SLIPPAGE)
    
    # 卖出收入 (taker fee)
    sell_revenue = best_bid * size * (1 - TAKER_FEE)
    
    # 净利润
    net_profit = sell_revenue - buy_cost
    profit_pct = (net_profit / buy_cost) * 100 if buy_cost > 0 else 0
    
    return {
        "profitable": net_profit > MIN_PROFIT,
        "net_profit": net_profit,
        "profit_pct": profit_pct,
        "buy_price": best_ask,
        "sell_price": best_bid,
        "spread": best_bid - best_ask,
        "spread_pct": ((best_bid - best_ask) / best_ask * 100) if best_ask > 0 else 0,
        "size": size,
        "buy_cost": buy_cost,
        "sell_revenue": sell_revenue,
        "fees": best_ask * size * TAKER_FEE + best_bid * size * TAKER_FEE,
        "slippage_cost": best_ask * size * SLIPPAGE
    }


def analyze_market(market: Dict) -> List[Dict]:
    """分析单个市场的套利机会"""
    opportunities = []
    
    token_ids = market.get("clobTokenIds", [])
    if not token_ids or len(token_ids) < 2:
        return opportunities
    
    # 只分析 Yes (0) 和 No (1) token
    yes_token = token_ids[0]
    no_token = token_ids[1] if len(token_ids) > 1 else None
    
    volume = float(market.get("volume") or 0)
    if volume < MIN_VOLUME:
        return opportunities
    
    # 获取订单簿
    yes_book = get_order_book(yes_token)
    if not yes_book:
        return opportunities
    
    # 解析最佳bid/ask
    bids = yes_book.get("bids", [])
    asks = yes_book.get("asks", [])
    
    if not bids or not asks:
        return opportunities
    
    best_bid = float(bids[0].get("price", 0))
    best_ask = float(asks[0].get("price", 0))
    best_bid_size = float(bids[0].get("size", 0))
    best_ask_size = float(asks[0].get("size", 0))
    
    # 计算套利
    size = min(best_bid_size, best_ask_size)
    result = calculate_arb_profit(best_bid, best_ask, size)
    
    if result["profitable"]:
        opportunities.append({
            "market": market.get("question"),
            "token_id": yes_token,
            "volume": volume,
            "yes_bid": best_bid,
            "yes_ask": best_ask,
            **result
        })
    
    return opportunities


def main():
    print("=" * 70)
    print("🔍 Polymarket 订单簿套利扫描器")
    print("=" * 70)
    print()
    
    # 获取市场
    print("📡 正在获取市场数据...")
    markets = get_markets(100)
    print(f"   获取到 {len(markets)} 个市场")
    print()
    
    # 分析每个市场
    print("📊 正在分析订单簿...")
    all_opportunities = []
    
    for i, market in enumerate(markets):
        if i % 20 == 0:
            print(f"   进度: {i}/{len(markets)}")
        
        opportunities = analyze_market(market)
        all_opportunities.extend(opportunities)
    
    print()
    print("=" * 70)
    print(f"📈 分析完成: 共 {len(all_opportunities)} 个潜在机会")
    print("=" * 70)
    print()
    
    # 显示结果
    if all_opportunities:
        print("🎯 套利机会 (已扣除手续费 + 滑点):")
        print("-" * 70)
        
        for opp in sorted(all_opportunities, key=lambda x: x["net_profit"], reverse=True):
            print(f"📌 {opp['market'][:60]}")
            print(f"   买价: ${opp['buy_price']:.4f} | 卖价: ${opp['sell_price']:.4f}")
            print(f"   价差: ${opp['spread']:.4f} ({opp['spread_pct']:.2f}%)")
            print(f"   💰 预估利润: ${opp['net_profit']:.4f} ({opp['profit_pct']:.2f}%)")
            print(f"   📊 交易量: ${opp['volume']:,.0f}")
            print()
    else:
        print("❌ 当前无利可图的套利机会")
        print()
        print("💡 原因分析:")
        print("   - 市场定价高效，bid-ask 价差通常被套利者迅速消除")
        print("   - 手续费和滑点侵蚀了潜在利润")
        print("   - 高频交易者有更快执行速度")
    
    print()
    print("⚠️ 风险提示:")
    print("   - 滑点可能大于预估")
    print("   - 市场波动时价格可能快速变化")
    print("   - 需要足够流动性才能执行大额交易")
    print("   - 建议先用小额测试")


if __name__ == "__main__":
    main()
