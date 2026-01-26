import { useSepoliaNetwork } from '../hooks'

/**
 * 合约未部署时的提示组件
 */
export function NotDeployed() {
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
