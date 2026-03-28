import { useMemo } from 'react'
import { getModelLimitKey, useContextStore } from '@/stores/useContextStore'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n/useI18n'

interface ContextIndicatorProps {
  sessionId: string
  modelId: string
  providerId?: string
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function getRingColor(percent: number): string {
  if (percent >= 90) return '#d9485f'
  if (percent >= 80) return '#d17a22'
  if (percent >= 60) return '#b28a17'
  return '#237a68'
}

export function ContextIndicator({
  sessionId,
  modelId,
  providerId
}: ContextIndicatorProps): React.JSX.Element | null {
  const { t } = useI18n()
  const tokenInfo = useContextStore((state) => state.tokensBySession[sessionId])
  const sessionModel = useContextStore((state) => state.modelBySession[sessionId])
  const modelLimits = useContextStore((state) => state.modelLimits)
  const cost = useContextStore((state) => state.costBySession[sessionId]) ?? 0

  const { used, limit, percent, tokens } = useMemo(() => {
    const t = tokenInfo ?? { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0 }
    const model =
      sessionModel ??
      (modelId
        ? {
            providerID: providerId ?? '*',
            modelID: modelId
          }
        : undefined)

    const lim = model
      ? (modelLimits[getModelLimitKey(model.modelID, model.providerID)] ??
        modelLimits[getModelLimitKey(model.modelID)])
      : undefined

    // Context window = total prompt tokens (input + cached).
    // Output and reasoning are generated tokens — they don't occupy the context window.
    const u = t.input + t.cacheRead + t.cacheWrite
    const pct = typeof lim === 'number' && lim > 0 ? Math.round((u / lim) * 100) : null
    return { used: u, limit: lim, percent: pct, tokens: t }
  }, [tokenInfo, sessionModel, modelId, providerId, modelLimits])

  const percentLabel = Math.min(100, Math.max(0, percent ?? 0))
  const ringColor = getRingColor(percentLabel)
  const circumference = 2 * Math.PI * 12
  const strokeOffset = circumference - (percentLabel / 100) * circumference

  // Don't render if no limit or no usage yet
  if (!limit && used === 0) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex h-8 w-8 shrink-0 cursor-default items-center justify-center rounded-full border border-border/60 bg-background/85 shadow-sm"
          data-testid="context-indicator"
          aria-label={
            typeof limit === 'number'
              ? t('contextIndicator.summary.withLimit', {
                  used: formatNumber(used),
                  limit: formatNumber(limit),
                  percent: percentLabel
                })
              : t('contextIndicator.summary.noLimit', { used: formatNumber(used) })
          }
        >
          <div className="relative h-7 w-7">
            <svg className="h-7 w-7 -rotate-90" viewBox="0 0 28 28" aria-hidden="true">
              <circle
                cx="14"
                cy="14"
                r="12"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                className="text-muted/80"
              />
              <circle
                cx="14"
                cy="14"
                r="12"
                stroke={ringColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-300"
                data-testid="context-ring"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/45" />
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8} className="max-w-[260px]">
        <div className="space-y-1.5">
          <div className="font-medium">{t('contextIndicator.title')}</div>
          {typeof limit === 'number' ? (
            <div>
              {t('contextIndicator.summary.withLimit', {
                used: formatNumber(used),
                limit: formatNumber(limit),
                percent: percent ?? 0
              })}
            </div>
          ) : (
            <div>{t('contextIndicator.summary.noLimit', { used: formatNumber(used) })}</div>
          )}
          <div className="border-t border-background/20 pt-1.5 space-y-0.5 text-[10px] opacity-80">
            <div>
              {t('contextIndicator.labels.input')}: {formatNumber(tokens.input)}
            </div>
            <div>
              {t('contextIndicator.labels.cacheRead')}: {formatNumber(tokens.cacheRead)}
            </div>
            <div>
              {t('contextIndicator.labels.cacheWrite')}: {formatNumber(tokens.cacheWrite)}
            </div>
          </div>
          {(tokens.output > 0 || tokens.reasoning > 0) && (
            <div className="border-t border-background/20 pt-1.5 space-y-0.5 text-[10px] opacity-60">
              <div className="opacity-100 text-[10px]">{t('contextIndicator.generated.title')}</div>
              {tokens.output > 0 && (
                <div>
                  {t('contextIndicator.generated.output')}: {formatNumber(tokens.output)}
                </div>
              )}
              {tokens.reasoning > 0 && (
                <div>
                  {t('contextIndicator.generated.reasoning')}: {formatNumber(tokens.reasoning)}
                </div>
              )}
            </div>
          )}
          {cost > 0 && (
            <div className="border-t border-background/20 pt-1.5">
              <div>{t('contextIndicator.cost.session', { cost: `$${cost.toFixed(4)}` })}</div>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
