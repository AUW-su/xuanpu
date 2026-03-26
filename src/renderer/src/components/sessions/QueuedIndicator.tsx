import { useI18n } from '@/i18n/useI18n'

interface QueuedIndicatorProps {
  count: number
}

export function QueuedIndicator({ count }: QueuedIndicatorProps): React.JSX.Element | null {
  const { t } = useI18n()
  if (count === 0) return null
  return (
    <div className="text-xs text-muted-foreground px-3 py-1">
      {t('queuedIndicator.label', { count })}
    </div>
  )
}
