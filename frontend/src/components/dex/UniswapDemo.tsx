'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  parseEther
} from 'viem'
import { hardhat } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { Button } from '@/components/ui/button'
import { CONTRACTS, isContractsDeployed } from '@/config/contracts'
import { TEST_ACCOUNTS } from '@/config/wagmi'

// 导入 ABI
import ERC20TokenABI from '@/abi/ERC20Token.json'
import UniswapV2RouterABI from '@/abi/UniswapV2Router.json'
import UniswapV2PairABI from '@/abi/UniswapV2Pair.json'

// 创建客户端
const publicClient = createPublicClient({
  chain: hardhat,
  transport: http('http://127.0.0.1:8545')
})

export function UniswapDemo() {
  const [mounted, setMounted] = useState(false)
  const [account, setAccount] = useState<ReturnType<
    typeof privateKeyToAccount
  > | null>(null)
  const [balances, setBalances] = useState({
    eth: '0',
    tokenA: '0',
    tokenB: '0',
    lp: '0'
  })
  const [reserves, setReserves] = useState({
    reserveA: '0',
    reserveB: '0',
    totalSupply: '0'
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const connectAccount = useCallback(() => {
    const acc = privateKeyToAccount(TEST_ACCOUNTS[0].privateKey)
    setAccount(acc)
  }, [])

  const fetchBalances = useCallback(async () => {
    if (!account) return
    try {
      const [eth, tokenA, tokenB, lp] = await Promise.all([
        publicClient.getBalance({ address: account.address }),
        publicClient.readContract({
          address: CONTRACTS.TokenA,
          abi: ERC20TokenABI,
          functionName: 'balanceOf',
          args: [account.address]
        }),
        publicClient.readContract({
          address: CONTRACTS.TokenB,
          abi: ERC20TokenABI,
          functionName: 'balanceOf',
          args: [account.address]
        }),
        publicClient.readContract({
          address: CONTRACTS.Pair,
          abi: UniswapV2PairABI,
          functionName: 'balanceOf',
          args: [account.address]
        })
      ])
      setBalances({
        eth: formatEther(eth),
        tokenA: formatEther(tokenA as bigint),
        tokenB: formatEther(tokenB as bigint),
        lp: formatEther(lp as bigint)
      })
    } catch (e) {
      console.error('获取余额失败:', e)
    }
  }, [account])

  const fetchReserves = useCallback(async () => {
    try {
      const [reservesData, totalSupply, token0] = await Promise.all([
        publicClient.readContract({
          address: CONTRACTS.Pair,
          abi: UniswapV2PairABI,
          functionName: 'getReserves'
        }),
        publicClient.readContract({
          address: CONTRACTS.Pair,
          abi: UniswapV2PairABI,
          functionName: 'totalSupply'
        }),
        publicClient.readContract({
          address: CONTRACTS.Pair,
          abi: UniswapV2PairABI,
          functionName: 'token0'
        })
      ])
      const [r0, r1] = reservesData as [bigint, bigint, number]
      const isToken0A = token0 === CONTRACTS.TokenA
      setReserves({
        reserveA: formatEther(isToken0A ? r0 : r1),
        reserveB: formatEther(isToken0A ? r1 : r0),
        totalSupply: formatEther(totalSupply as bigint)
      })
    } catch (e) {
      console.error('获取储备量失败:', e)
    }
  }, [])

  useEffect(() => {
    if (account) {
      fetchBalances()
      fetchReserves()
    }
  }, [account, fetchBalances, fetchReserves])

  if (!mounted) return null

  if (!isContractsDeployed()) {
    return <NotDeployedMessage />
  }

  return (
    <div className="space-y-6">
      {/* 连接区域 */}
      <div className="p-4 rounded-xl border border-border/50 bg-card/50">
        <h3 className="text-lg font-semibold mb-3">🔗 账户</h3>
        {account ? (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <code className="text-xs bg-background/50 px-2 py-1 rounded">
              {account.address}
            </code>
            <Button variant="outline" size="sm" onClick={() => setAccount(null)}>
              断开
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={connectAccount}>
            连接测试账户
          </Button>
        )}
      </div>

      {account && (
        <>
          <BalanceSection balances={balances} onRefresh={fetchBalances} />
          <SwapSection
            account={account}
            onSuccess={() => {
              fetchBalances()
              fetchReserves()
            }}
          />
          <LiquiditySection
            account={account}
            onSuccess={() => {
              fetchBalances()
              fetchReserves()
            }}
          />
          <PoolInfoSection reserves={reserves} />
        </>
      )}
    </div>
  )
}

function NotDeployedMessage() {
  return (
    <div className="p-6 rounded-xl border border-yellow-500/50 bg-yellow-500/10">
      <h3 className="text-lg font-bold text-yellow-500 mb-2">⚠️ 合约未部署</h3>
      <p className="text-sm text-muted-foreground mb-3">请先启动本地节点并部署合约：</p>
      <pre className="bg-black/50 p-3 rounded text-xs overflow-x-auto">
        {`cd contracts
npm run node          # 终端1
npm run deploy:uniswap  # 终端2`}
      </pre>
    </div>
  )
}


function BalanceSection({
  balances,
  onRefresh
}: {
  balances: { eth: string; tokenA: string; tokenB: string; lp: string }
  onRefresh: () => void
}) {
  return (
    <div className="p-4 rounded-xl border border-border/50 bg-card/50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">💰 余额</h3>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          刷新
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-muted-foreground text-xs">ETH</p>
          <p className="font-medium">{parseFloat(balances.eth).toFixed(4)}</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-muted-foreground text-xs">TKA</p>
          <p className="font-medium">{parseFloat(balances.tokenA).toFixed(2)}</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-muted-foreground text-xs">TKB</p>
          <p className="font-medium">{parseFloat(balances.tokenB).toFixed(2)}</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-muted-foreground text-xs">LP</p>
          <p className="font-medium">{parseFloat(balances.lp).toFixed(4)}</p>
        </div>
      </div>
    </div>
  )
}

function SwapSection({
  account,
  onSuccess
}: {
  account: ReturnType<typeof privateKeyToAccount>
  onSuccess: () => void
}) {
  const [amountIn, setAmountIn] = useState('')
  const [direction, setDirection] = useState<'AtoB' | 'BtoA'>('AtoB')
  const [expectedOut, setExpectedOut] = useState('0')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const tokenIn = direction === 'AtoB' ? CONTRACTS.TokenA : CONTRACTS.TokenB
  const tokenOut = direction === 'AtoB' ? CONTRACTS.TokenB : CONTRACTS.TokenA

  useEffect(() => {
    const fetchQuote = async () => {
      if (!amountIn || parseFloat(amountIn) <= 0) {
        setExpectedOut('0')
        return
      }
      try {
        const amounts = (await publicClient.readContract({
          address: CONTRACTS.Router,
          abi: UniswapV2RouterABI,
          functionName: 'getAmountsOut',
          args: [parseEther(amountIn), [tokenIn, tokenOut]]
        })) as bigint[]
        setExpectedOut(formatEther(amounts[1]))
      } catch {
        setExpectedOut('0')
      }
    }
    fetchQuote()
  }, [amountIn, tokenIn, tokenOut])

  const walletClient = createWalletClient({
    account,
    chain: hardhat,
    transport: http('http://127.0.0.1:8545')
  })

  const handleSwap = async () => {
    if (!amountIn) return
    setLoading(true)
    setStatus('授权中...')
    try {
      const approveHash = await walletClient.writeContract({
        address: tokenIn,
        abi: ERC20TokenABI,
        functionName: 'approve',
        args: [CONTRACTS.Router, parseEther(amountIn)]
      })
      await publicClient.waitForTransactionReceipt({ hash: approveHash })

      setStatus('交换中...')
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
      const swapHash = await walletClient.writeContract({
        address: CONTRACTS.Router,
        abi: UniswapV2RouterABI,
        functionName: 'swapExactTokensForTokens',
        args: [
          parseEther(amountIn),
          0n,
          [tokenIn, tokenOut],
          account.address,
          deadline
        ]
      })
      await publicClient.waitForTransactionReceipt({ hash: swapHash })

      setStatus('✅ 成功')
      setAmountIn('')
      onSuccess()
    } catch (e: unknown) {
      setStatus(`❌ ${(e as Error).message?.slice(0, 30)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 rounded-xl border border-border/50 bg-card/50">
      <h3 className="text-lg font-semibold mb-3">🔄 交换</h3>
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            variant={direction === 'AtoB' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDirection('AtoB')}
          >
            TKA→TKB
          </Button>
          <Button
            variant={direction === 'BtoA' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDirection('BtoA')}
          >
            TKB→TKA
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">输入</label>
            <input
              type="number"
              value={amountIn}
              onChange={e => setAmountIn(e.target.value)}
              placeholder="0.0"
              className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">预期输出</label>
            <div className="mt-1 p-2 rounded-lg bg-background/50 border border-border text-sm">
              {parseFloat(expectedOut).toFixed(4)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleSwap} disabled={!amountIn || loading}>
            {loading ? status : '交换'}
          </Button>
          {status && !loading && (
            <span className="text-xs text-muted-foreground">{status}</span>
          )}
        </div>
      </div>
    </div>
  )
}


function LiquiditySection({
  account,
  onSuccess
}: {
  account: ReturnType<typeof privateKeyToAccount>
  onSuccess: () => void
}) {
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const [lpToRemove, setLpToRemove] = useState('')
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const walletClient = createWalletClient({
    account,
    chain: hardhat,
    transport: http('http://127.0.0.1:8545')
  })

  const handleAddLiquidity = async () => {
    if (!amountA || !amountB) return
    setLoading(true)
    try {
      setStatus('授权 TKA...')
      const approveAHash = await walletClient.writeContract({
        address: CONTRACTS.TokenA,
        abi: ERC20TokenABI,
        functionName: 'approve',
        args: [CONTRACTS.Router, parseEther(amountA)]
      })
      await publicClient.waitForTransactionReceipt({ hash: approveAHash })

      setStatus('授权 TKB...')
      const approveBHash = await walletClient.writeContract({
        address: CONTRACTS.TokenB,
        abi: ERC20TokenABI,
        functionName: 'approve',
        args: [CONTRACTS.Router, parseEther(amountB)]
      })
      await publicClient.waitForTransactionReceipt({ hash: approveBHash })

      setStatus('添加中...')
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
      const addHash = await walletClient.writeContract({
        address: CONTRACTS.Router,
        abi: UniswapV2RouterABI,
        functionName: 'addLiquidity',
        args: [
          CONTRACTS.TokenA,
          CONTRACTS.TokenB,
          parseEther(amountA),
          parseEther(amountB),
          0n,
          0n,
          account.address,
          deadline
        ]
      })
      await publicClient.waitForTransactionReceipt({ hash: addHash })

      setStatus('✅ 成功')
      setAmountA('')
      setAmountB('')
      onSuccess()
    } catch (e: unknown) {
      setStatus(`❌ ${(e as Error).message?.slice(0, 30)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveLiquidity = async () => {
    if (!lpToRemove) return
    setLoading(true)
    try {
      setStatus('授权 LP...')
      const approveLPHash = await walletClient.writeContract({
        address: CONTRACTS.Pair,
        abi: UniswapV2PairABI,
        functionName: 'approve',
        args: [CONTRACTS.Router, parseEther(lpToRemove)]
      })
      await publicClient.waitForTransactionReceipt({ hash: approveLPHash })

      setStatus('移除中...')
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
      const removeHash = await walletClient.writeContract({
        address: CONTRACTS.Router,
        abi: UniswapV2RouterABI,
        functionName: 'removeLiquidity',
        args: [
          CONTRACTS.TokenA,
          CONTRACTS.TokenB,
          parseEther(lpToRemove),
          0n,
          0n,
          account.address,
          deadline
        ]
      })
      await publicClient.waitForTransactionReceipt({ hash: removeHash })

      setStatus('✅ 成功')
      setLpToRemove('')
      onSuccess()
    } catch (e: unknown) {
      setStatus(`❌ ${(e as Error).message?.slice(0, 30)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 rounded-xl border border-border/50 bg-card/50">
      <h3 className="text-lg font-semibold mb-3">💧 流动性</h3>
      <div className="flex gap-2 mb-3">
        <Button
          variant={activeTab === 'add' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setActiveTab('add')
            setStatus('')
          }}
        >
          添加
        </Button>
        <Button
          variant={activeTab === 'remove' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setActiveTab('remove')
            setStatus('')
          }}
        >
          移除
        </Button>
      </div>

      {activeTab === 'add' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">TKA</label>
              <input
                type="number"
                value={amountA}
                onChange={e => setAmountA(e.target.value)}
                placeholder="0.0"
                className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">TKB</label>
              <input
                type="number"
                value={amountB}
                onChange={e => setAmountB(e.target.value)}
                placeholder="0.0"
                className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleAddLiquidity}
              disabled={!amountA || !amountB || loading}
            >
              {loading ? status : '添加流动性'}
            </Button>
            {status && !loading && (
              <span className="text-xs text-muted-foreground">{status}</span>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">LP 数量</label>
            <input
              type="number"
              value={lpToRemove}
              onChange={e => setLpToRemove(e.target.value)}
              placeholder="0.0"
              className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleRemoveLiquidity}
              disabled={!lpToRemove || loading}
            >
              {loading ? status : '移除流动性'}
            </Button>
            {status && !loading && (
              <span className="text-xs text-muted-foreground">{status}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PoolInfoSection({
  reserves
}: {
  reserves: { reserveA: string; reserveB: string; totalSupply: string }
}) {
  const reserveA = parseFloat(reserves.reserveA)
  const reserveB = parseFloat(reserves.reserveB)
  const priceAinB = reserveA > 0 ? reserveB / reserveA : 0
  const kValue = reserveA * reserveB

  // 格式化 K 值显示
  const formatK = (k: number) => {
    if (k === 0) return '0'
    if (k >= 1e9) return `${(k / 1e9).toFixed(2)}B`
    if (k >= 1e6) return `${(k / 1e6).toFixed(2)}M`
    if (k >= 1e3) return `${(k / 1e3).toFixed(2)}K`
    return k.toFixed(2)
  }

  return (
    <div className="p-4 rounded-xl border border-border/50 bg-card/50">
      <h3 className="text-lg font-semibold mb-3">📊 池子信息</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-muted-foreground text-xs">TKA 储备</p>
          <p className="font-medium">{reserveA.toFixed(2)}</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-muted-foreground text-xs">TKB 储备</p>
          <p className="font-medium">{reserveB.toFixed(2)}</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-muted-foreground text-xs">价格</p>
          <p className="font-medium">1 TKA = {priceAinB.toFixed(4)} TKB</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-muted-foreground text-xs">LP 总量</p>
          <p className="font-medium">{parseFloat(reserves.totalSupply).toFixed(2)}</p>
        </div>
        <div className="col-span-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <p className="text-muted-foreground text-xs">K 值 (x × y = k)</p>
          <p className="font-medium text-purple-400">{formatK(kValue)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {kValue > 0 ? kValue.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}
          </p>
        </div>
      </div>
    </div>
  )
}
