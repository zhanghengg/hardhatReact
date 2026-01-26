import type { Balances } from '../types'

interface BalanceSectionProps {
  balances: Balances
  onRefresh: () => void
}

// 代币配置
const TOKEN_CONFIG = [
  { key: 'eth', label: 'ETH', icon: 'E', gradient: 'from-slate-500 to-slate-600', decimals: 4 },
  { key: 'tokenA', label: 'TKA', icon: 'A', gradient: 'from-blue-500 to-blue-600', decimals: 2 },
  { key: 'tokenB', label: 'TKB', icon: 'B', gradient: 'from-purple-500 to-purple-600', decimals: 2 },
  { key: 'lp', label: 'LP', icon: 'L', gradient: 'from-pink-500 to-violet-500', decimals: 4 }
] as const

/**
 * 余额展示组件 - 现代风格
 */
export function BalanceSection({ balances, onRefresh }: BalanceSectionProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/80 shadow-lg overflow-hidden">
      {/* 标题栏 */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-border/30">
        <h3 className="text-base font-semibold">余额</h3>
        <button 
          onClick={onRefresh}
          className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
          title="刷新余额"
        >
          <svg className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {/* 余额列表 */}
      <div className="p-3 space-y-2">
        {TOKEN_CONFIG.map(token => (
          <BalanceItem
            key={token.key}
            label={token.label}
            icon={token.icon}
            gradient={token.gradient}
            value={parseFloat(balances[token.key]).toFixed(token.decimals)}
          />
        ))}
      </div>
    </div>
  )
}

interface BalanceItemProps {
  label: string
  icon: string
  gradient: string
  value: string
}

function BalanceItem({ label, icon, gradient, value }: BalanceItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-3">
        {/* 代币图标 */}
        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  )
}
