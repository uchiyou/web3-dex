#!/usr/bin/env python3
"""
DeFi 收益率分析工具
基于公开数据分析各协议收益率

数据来源: DefiLlama, Yearn, 各大 DeFi 协议
"""

import requests
import json

def get_aave_rates():
    """获取 Aave 利率"""
    try:
        # Aave V3 Ethereum
        resp = requests.get("https://aave-api-v2.aave.com/data/markets", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            rates = []
            for pool in data:
                if pool.get('underlyingAsset') == '0x0000000000000000000000000000000000000000':  # ETH
                    rates.append({
                        'protocol': 'Aave V3',
                        'asset': 'ETH',
                        'supply_apy': float(pool.get('supplyAPY', 0)) * 100,
                        'borrow_apy': float(pool.get('borrowAPY', 0)) * 100,
                    })
            return rates
    except:
        pass
    return []

def get_yearn_vaults():
    """获取 Yearn Vaults 收益率"""
    try:
        resp = requests.get("https://api.yearn.finance/v1/chains/1/vaults", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            vaults = []
            for v in data[:20]:
                apy = v.get('apy', {}).get('net_apy', 0)
                if apy:
                    vaults.append({
                        'protocol': 'Yearn',
                        'vault': v.get('name', 'N/A')[:30],
                        'apy': float(apy) * 100,
                        'chain': 'Ethereum'
                    })
            return sorted(vaults, key=lambda x: x['apy'], reverse=True)[:10]
    except Exception as e:
        print(f"Yearn API error: {e}")
    return []

def get_compound_rates():
    """获取 Compound 利率"""
    try:
        resp = requests.get("https://api.compound.finance/api/v2/markets", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            rates = []
            for c in data.get('cToken', [])[:10]:
                rates.append({
                    'protocol': 'Compound',
                    'asset': c.get('underlying_symbol', 'N/A'),
                    'supply_apy': float(c.get('supply_apy_percentage', 0)),
                })
            return sorted(rates, key=lambda x: x['supply_apy'], reverse=True)
    except:
        pass
    return []

def get_lido_steth_apy():
    """获取 Lido STETH 收益率"""
    try:
        resp = requests.get("https://api.lido.fi/v1/steth/apr", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            return {
                'protocol': 'Lido',
                'asset': 'stETH',
                'apy': float(data.get('apr', 0)) * 100,
                'chain': 'Ethereum'
            }
    except:
        pass
    return None

def get_rocketpool_apy():
    """获取 Rocket Pool 收益率"""
    try:
        resp = requests.get("https://api.rocketpool.net/api/node/stat", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            return {
                'protocol': 'Rocket Pool',
                'asset': 'rETH',
                'apy': float(data.get('node_rpl_apr', 0)) * 100,
                'chain': 'Ethereum'
            }
    except:
        pass
    return None

def main():
    print("="*70)
    print("🔥 DeFi 收益率排行榜")
    print("="*70)
    print()
    
    all_yields = []
    
    # 1. Lido
    print("📊 正在获取 Lido (stETH) 收益率...")
    lido = get_lido_steth_apy()
    if lido:
        all_yields.append(lido)
        print(f"   ✅ Lido: {lido['apy']:.2f}%")
    
    # 2. Rocket Pool
    print("📊 正在获取 Rocket Pool 收益率...")
    rocket = get_rocketpool_apy()
    if rocket:
        all_yields.append(rocket)
        print(f"   ✅ Rocket Pool: {rocket['apy']:.2f}%")
    
    # 3. Yearn
    print("📊 正在获取 Yearn Vaults...")
    yearn_vaults = get_yearn_vaults()
    if yearn_vaults:
        all_yields.extend(yearn_vaults)
        print(f"   ✅ 获取 {len(yearn_vaults)} 个 Vaults")
    
    # 4. Compound
    print("📊 正在获取 Compound 利率...")
    compound = get_compound_rates()
    if compound:
        for c in compound:
            all_yields.append({
                'protocol': 'Compound',
                'asset': c['asset'],
                'apy': c['supply_apy'],
                'chain': 'Ethereum'
            })
        print(f"   ✅ 获取 {len(compound)} 个市场")
    
    print()
    print("="*70)
    print("📈 收益率排名 (从高到低)")
    print("="*70)
    print()
    
    # 排序
    sorted_yields = sorted(all_yields, key=lambda x: x.get('apy', 0), reverse=True)
    
    for i, y in enumerate(sorted_yields[:15], 1):
        protocol = y.get('protocol', 'N/A')
        asset = y.get('asset', y.get('vault', 'N/A'))[:15]
        apy = y.get('apy', 0)
        chain = y.get('chain', 'Ethereum')
        
        # 颜色标记
        if apy > 10:
            marker = "🔥"
        elif apy > 5:
            marker = "📈"
        elif apy > 2:
            marker = "✅"
        else:
            marker = "⚖️"
        
        print(f"{i:2}. {marker} {protocol:<15} | {asset:<18} | APY: {apy:>7.2f}% | {chain}")
    
    print()
    print("="*70)
    print("💡 投资建议")
    print("="*70)
    print("""
1. 稳健型:
   - USDC/USDT -> Aave/Compound 存稳定币 (~4-8%)
   - ETH -> Lido 质押 (~4-5%)

2. 进取型:
   - Yearn Vaults (高风险高收益)
   - 流动性挖矿 (需研究具体协议)

3. 风险提示:
   - DeFi 投资有智能合约风险
   - APY 会波动，以实际为准
   - 入场前务必做好研究
""")

if __name__ == "__main__":
    main()
