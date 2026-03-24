import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/useI18n'

// Git status codes
type GitStatusCode = 'M' | 'A' | 'D' | '?' | 'C' | ''

interface GitStatusIndicatorProps {
  status: GitStatusCode
  staged?: boolean
  className?: string
}

// Status colors per the IMPLEMENTATION-P2.md spec
const statusColors: Record<GitStatusCode, string> = {
  M: 'text-yellow-500', // Modified - yellow
  A: 'text-green-500', // Added/Staged - green
  D: 'text-red-500', // Deleted - red
  '?': 'text-gray-500', // Untracked - gray
  C: 'text-red-600 font-bold', // Conflicted - red bold
  '': ''
}

export function GitStatusIndicator({
  status,
  staged,
  className
}: GitStatusIndicatorProps): React.JSX.Element | null {
  const { t } = useI18n()
  if (!status) return null

  // If the file is staged, show as green regardless of type
  const displayStatus = staged && status !== 'C' ? 'A' : status
  const colorClass = statusColors[displayStatus]
  const statusTitles: Record<GitStatusCode, string> = {
    M: t('fileTree.gitStatus.modified'),
    A: t('fileTree.gitStatus.staged'),
    D: t('fileTree.gitStatus.deleted'),
    '?': t('fileTree.gitStatus.untracked'),
    C: t('fileTree.gitStatus.conflicted'),
    '': ''
  }
  const title = statusTitles[status] + (staged ? t('fileTree.gitStatus.stagedSuffix') : '')

  return (
    <span
      className={cn('text-[10px] font-mono ml-auto flex-shrink-0', colorClass, className)}
      title={title}
    >
      {status}
    </span>
  )
}

export type { GitStatusCode }
