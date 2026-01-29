'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

// 热门交易对
const POPULAR_SYMBOLS = [
  { symbol: 'BTCUSDT', label: 'BTC' },
  { symbol: 'ETHUSDT', label: 'ETH' },
  { symbol: 'BNBUSDT', label: 'BNB' },
  { symbol: 'SOLUSDT', label: 'SOL' },
  { symbol: 'XRPUSDT', label: 'XRP' },
  { symbol: 'DOGEUSDT', label: 'DOGE' },
]

interface SymbolSearchProps {
  /** 当前选中的符号 */
  value: string
  /** 符号变化回调 */
  onChange: (symbol: string) => void
  /** 类名 */
  className?: string
}

interface SearchResult {
  symbol: string
  baseAsset: string
  quoteAsset: string
}

/**
 * 交易对搜索组件
 */
export function SymbolSearch({ value, onChange, className = '' }: SymbolSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 搜索交易对
  const searchSymbols = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('https://api.binance.com/api/v3/exchangeInfo')
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      const query = searchQuery.toUpperCase()
      
      const filtered = data.symbols
        .filter((s: { symbol: string; status: string; quoteAsset: string; baseAsset: string }) => 
          s.status === 'TRADING' && 
          s.quoteAsset === 'USDT' &&
          (s.symbol.includes(query) || s.baseAsset.includes(query))
        )
        .slice(0, 20)
        .map((s: { symbol: string; baseAsset: string; quoteAsset: string }) => ({
          symbol: s.symbol,
          baseAsset: s.baseAsset,
          quoteAsset: s.quoteAsset,
        }))
      
      setResults(filtered)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchSymbols(query)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, searchSymbols])

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 选择交易对
  const handleSelect = (symbol: string) => {
    onChange(symbol)
    setIsOpen(false)
    setQuery('')
  }

  // 格式化显示
  const formatDisplay = (symbol: string) => {
    if (symbol.endsWith('USDT')) {
      return `${symbol.slice(0, -4)}/USDT`
    }
    return symbol
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 触发按钮 */}
      <Button
        variant="outline"
        className="w-[180px] justify-between font-mono"
        onClick={() => {
          setIsOpen(!isOpen)
          setTimeout(() => inputRef.current?.focus(), 100)
        }}
      >
        <span className="truncate">{formatDisplay(value)}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[280px] rounded-lg border bg-popover shadow-lg z-50">
          {/* 搜索框 */}
          <div className="flex items-center gap-2 p-2 border-b">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索交易对..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* 热门交易对 */}
          {!query && (
            <div className="p-2 border-b">
              <div className="text-xs text-muted-foreground mb-2">热门</div>
              <div className="flex flex-wrap gap-1">
                {POPULAR_SYMBOLS.map(({ symbol, label }) => (
                  <button
                    key={symbol}
                    onClick={() => handleSelect(symbol)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      value === symbol
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 搜索结果 */}
          <div className="max-h-[240px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                搜索中...
              </div>
            ) : results.length > 0 ? (
              <div className="py-1">
                {results.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => handleSelect(item.symbol)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
                      value === item.symbol ? 'bg-muted' : ''
                    }`}
                  >
                    <span className="font-medium">{item.baseAsset}</span>
                    <span className="text-muted-foreground">/{item.quoteAsset}</span>
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                未找到交易对
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default SymbolSearch
