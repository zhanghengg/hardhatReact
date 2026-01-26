import { useSepoliaNetwork } from '../hooks'

/**
 * 网络指示器组件
 */
export function NetworkIndicator() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span
        className={`w-2 h-2 rounded-full ${
          useSepoliaNetwork ? 'bg-yellow-500' : 'bg-green-500'
        }`}
      />
      {useSepoliaNetwork ? 'Sepolia 测试网' : '本地开发网络'}
    </div>
  )
}
