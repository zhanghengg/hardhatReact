import type { AccountType } from '../types'

interface AccountInfoProps {
  account: AccountType
}

/**
 * 账户信息展示组件
 */
export function AccountInfo({ account }: AccountInfoProps) {
  return (
    <div className="p-4 rounded-xl border border-border/50 bg-card/50">
      <h3 className="text-lg font-semibold mb-2">🔗 Demo 账户</h3>
      <code className="text-xs bg-background/50 px-2 py-1 rounded">
        {account.address}
      </code>
      <p className="text-xs text-muted-foreground mt-2">
        ⚠️ 硬编码账户，仅作为演示使用
      </p>
    </div>
  )
}
