import { CONTRACTS } from '@/config/contracts'
import { useSepoliaNetwork, SEPOLIA_EXPLORER } from '../hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ContractInfo {
  name: string
  address: string
  description: string
  icon: string
  gradient: string
}

const contracts: ContractInfo[] = [
  { name: 'Factory', address: CONTRACTS.Factory, description: '工厂合约', icon: 'F', gradient: 'from-amber-500 to-orange-500' },
  { name: 'Router', address: CONTRACTS.Router, description: '路由合约', icon: 'R', gradient: 'from-emerald-500 to-teal-500' },
  { name: 'TokenA', address: CONTRACTS.TokenA, description: '测试代币 A', icon: 'A', gradient: 'from-blue-500 to-blue-600' },
  { name: 'TokenB', address: CONTRACTS.TokenB, description: '测试代币 B', icon: 'B', gradient: 'from-purple-500 to-purple-600' },
  { name: 'Pair (LP)', address: CONTRACTS.Pair, description: '交易对合约', icon: 'P', gradient: 'from-pink-500 to-violet-500' }
]

/**
 * 合约地址展示组件
 */
export function ContractAddresses() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          合约地址
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {contracts.map(contract => (
          <ContractItem key={contract.name} contract={contract} />
        ))}
        {useSepoliaNetwork && (
          <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/50">
            点击「查看」可在 Sepolia Etherscan 上查看合约详情
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function ContractItem({ contract }: { contract: ContractInfo }) {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2.5">
        {/* 合约图标 */}
        <div className={`w-7 h-7 rounded-full bg-gradient-to-r ${contract.gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
          {contract.icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{contract.name}</span>
          <span className="text-xs text-muted-foreground">
            {contract.description}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <code className="text-xs bg-background/80 px-2 py-1 rounded border border-border/50 font-mono">
          {truncateAddress(contract.address)}
        </code>
        {useSepoliaNetwork ? (
          <ExplorerLink address={contract.address} />
        ) : (
          <span className="text-xs text-muted-foreground px-1">本地</span>
        )}
      </div>
    </div>
  )
}

function ExplorerLink({ address }: { address: string }) {
  return (
    <a
      href={`${SEPOLIA_EXPLORER}/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-blue-500 hover:text-blue-400 hover:underline flex items-center gap-1"
    >
      <span>查看</span>
      <ExternalLinkIcon />
    </a>
  )
}

function ExternalLinkIcon() {
  return (
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
  )
}
