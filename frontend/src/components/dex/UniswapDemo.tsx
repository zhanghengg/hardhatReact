'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  formatEther,
  parseEther,
  type Chain
} from 'viem'
import { hardhat, sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { Button } from '@/components/ui/button'
import { CONTRACTS, isContractsDeployed } from '@/config/contracts'
import { TEST_ACCOUNTS, DEMO_TEST_ACCOUNT } from '@/config/wagmi'

// 导入 ABI
import ERC20TokenABI from '@/abi/ERC20Token.json'
import UniswapV2RouterABI from '@/abi/UniswapV2Router.json'
import UniswapV2PairABI from '@/abi/UniswapV2Pair.json'

// 网络配置
// NEXT_PUBLIC_NETWORK 可选值: 'local' | 'sepolia' | 'auto'
// - 'local': 强制使用本地 Hardhat 网络
// - 'sepolia': 强制使用 Sepolia 测试网
// - 'auto' (默认): 开发环境用本地，生产环境用 Sepolia
const networkEnv = process.env.NEXT_PUBLIC_NETWORK || 'auto'
const isProduction = process.env.NODE_ENV === 'production'

const useSepoliaNetwork =
  networkEnv === 'sepolia' || (networkEnv === 'auto' && isProduction)

// RPC URL 配置
const SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'

// 根据环境选择网络配置
const getChainConfig = (): { chain: Chain; rpcUrl: string } => {
  if (useSepoliaNetwork) {
    return {
      chain: sepolia,
      rpcUrl: SEPOLIA_RPC_URL
    }
  }
  return {
    chain: hardhat,
    rpcUrl: 'http://127.0.0.1:8545'
  }
}

const { chain: currentChain, rpcUrl } = getChainConfig()

// 创建公共客户端
const publicClient = createPublicClient({
  chain: currentChain,
  transport: http(rpcUrl)
})

// 账户类型
type AccountType =
  | ReturnType<typeof privateKeyToAccount>
  | { address: `0x${string}`; type: 'injected' }

export function UniswapDemo() {
  const [mounted, setMounted] = useState(false)
  const [account, setAccount] = useState<AccountType | null>(null)
  const [connectionMode, setConnectionMode] = useState<'test' | 'wallet'>('test')
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

  // 自动连接 Demo 账户
  useEffect(() => {
    setMounted(true)
    const testKey = useSepoliaNetwork
      ? DEMO_TEST_ACCOUNT.privateKey
      : TEST_ACCOUNTS[0].privateKey
    const acc = privateKeyToAccount(testKey)
    setAccount(acc)
    setConnectionMode('test')
  }, [])


  const fetchBalances = useCallback(async () => {
    if (!account) return
    try {
      const address = account.address
      const [eth, tokenA, tokenB, lp] = await Promise.all([
        publicClient.getBalance({ address }),
        publicClient.readContract({
          address: CONTRACTS.TokenA,
          abi: ERC20TokenABI,
          functionName: 'balanceOf',
          args: [address]
        }),
        publicClient.readContract({
          address: CONTRACTS.TokenB,
          abi: ERC20TokenABI,
          functionName: 'balanceOf',
          args: [address]
        }),
        publicClient.readContract({
          address: CONTRACTS.Pair,
          abi: UniswapV2PairABI,
          functionName: 'balanceOf',
          args: [address]
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
      {/* 网络指示器 */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className={`w-2 h-2 rounded-full ${useSepoliaNetwork ? 'bg-yellow-500' : 'bg-green-500'}`}
        />
        {useSepoliaNetwork ? 'Sepolia 测试网' : '本地开发网络'}
      </div>

      {/* 账户信息 */}
      {account && (
        <div className="p-4 rounded-xl border border-border/50 bg-card/50">
          <h3 className="text-lg font-semibold mb-2">🔗 Demo 账户</h3>
          <code className="text-xs bg-background/50 px-2 py-1 rounded">
            {account.address}
          </code>
          <p className="text-xs text-muted-foreground mt-2">
            ⚠️ 硬编码账户，仅作为演示使用
          </p>
        </div>
      )}

      {/* 合约地址信息 - 始终显示 */}
      <ContractAddressesSection />

      {account && (
        <>
          <BalanceSection balances={balances} onRefresh={fetchBalances} />
          <SwapSection
            account={account}
            connectionMode={connectionMode}
            onSuccess={() => {
              fetchBalances()
              fetchReserves()
            }}
          />
          <LiquiditySection
            account={account}
            connectionMode={connectionMode}
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
      <p className="text-sm text-muted-foreground mb-3">
        {useSepoliaNetwork
          ? '合约地址配置无效，请联系管理员。'
          : '请先启动本地节点并部署合约：'}
      </p>
      {!useSepoliaNetwork && (
        <pre className="bg-black/50 p-3 rounded text-xs overflow-x-auto">
          {`cd contracts
npm run node          # 终端1
npm run deploy:uniswap  # 终端2`}
        </pre>
      )}
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
  connectionMode,
  onSuccess
}: {
  account: AccountType
  connectionMode: 'test' | 'wallet'
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

  const getWalletClient = () => {
    const address = account.address
    if (connectionMode === 'wallet' && typeof window !== 'undefined' && window.ethereum) {
      return createWalletClient({
        account: address,
        chain: currentChain,
        transport: custom(window.ethereum)
      })
    }
    // 测试账户模式
    return createWalletClient({
      account: account as ReturnType<typeof privateKeyToAccount>,
      chain: currentChain,
      transport: http(rpcUrl)
    })
  }

  const handleSwap = async () => {
    if (!amountIn) return
    setLoading(true)
    setStatus('授权中...')
    try {
      const walletClient = getWalletClient()
      const address = account.address

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
          address,
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
  connectionMode,
  onSuccess
}: {
  account: AccountType
  connectionMode: 'test' | 'wallet'
  onSuccess: () => void
}) {
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const [lpToRemove, setLpToRemove] = useState('')
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const getWalletClient = () => {
    const address = account.address
    if (connectionMode === 'wallet' && typeof window !== 'undefined' && window.ethereum) {
      return createWalletClient({
        account: address,
        chain: currentChain,
        transport: custom(window.ethereum)
      })
    }
    return createWalletClient({
      account: account as ReturnType<typeof privateKeyToAccount>,
      chain: currentChain,
      transport: http(rpcUrl)
    })
  }

  const handleAddLiquidity = async () => {
    if (!amountA || !amountB) return
    setLoading(true)
    try {
      const walletClient = getWalletClient()
      const address = account.address

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
          address,
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
      const walletClient = getWalletClient()
      const address = account.address

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
          address,
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

function ContractAddressesSection() {
  const SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io/address'

  const contracts = [
    { name: 'Factory', address: CONTRACTS.Factory, description: '工厂合约' },
    { name: 'Router', address: CONTRACTS.Router, description: '路由合约' },
    { name: 'TokenA (TKA)', address: CONTRACTS.TokenA, description: '测试代币 A' },
    { name: 'TokenB (TKB)', address: CONTRACTS.TokenB, description: '测试代币 B' },
    { name: 'Pair (LP)', address: CONTRACTS.Pair, description: '交易对合约' },
  ]

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="p-4 rounded-xl border border-border/50 bg-card/50">
      <h3 className="text-lg font-semibold mb-3">📋 合约地址</h3>
      <div className="space-y-2">
        {contracts.map((contract) => (
          <div
            key={contract.name}
            className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">{contract.name}</span>
              <span className="text-xs text-muted-foreground">{contract.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-background px-2 py-1 rounded border border-border">
                {truncateAddress(contract.address)}
              </code>
              {useSepoliaNetwork ? (
                <a
                  href={`${SEPOLIA_EXPLORER}/${contract.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>查看</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">本地</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {useSepoliaNetwork && (
        <p className="text-xs text-muted-foreground mt-3">
          点击「查看」可在 Sepolia Etherscan 上查看合约详情
        </p>
      )}
    </div>
  )
}

// 扩展 Window 类型以支持 ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }
  }
}
