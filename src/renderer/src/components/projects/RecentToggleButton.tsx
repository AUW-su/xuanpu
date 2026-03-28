import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRecentStore } from '@/stores'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/useI18n'

export function RecentToggleButton(): React.JSX.Element {
  const recentVisible = useRecentStore((s) => s.recentVisible)
  const toggleRecent = useRecentStore((s) => s.toggleRecent)
  const { t } = useI18n()

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/70',
        recentVisible && 'text-primary bg-sidebar-accent'
      )}
      title={t('sidebar.recentToggleTitle')}
      onClick={toggleRecent}
      data-testid="recent-toggle-button"
    >
      <Zap className="h-4 w-4" />
    </Button>
  )
}
