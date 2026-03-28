import { useEffect, useRef, useCallback, useMemo } from 'react'
import Ansi from 'ansi-to-react'
import { RotateCcw, Loader2, CheckCircle2, XCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useScriptStore } from '@/stores/useScriptStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useWorktreeStore, fireSetupScript } from '@/stores/useWorktreeStore'
import { useI18n } from '@/i18n/useI18n'

interface SetupTabProps {
  worktreeId: string | null
}

export function SetupTab({ worktreeId }: SetupTabProps): React.JSX.Element {
  const { t } = useI18n()
  const outputRef = useRef<HTMLDivElement>(null)

  const scriptState = useScriptStore((s) => (worktreeId ? s.scriptStates[worktreeId] : null))

  const emptyOutput: string[] = useMemo(() => [], [])
  const setupOutput = scriptState?.setupOutput ?? emptyOutput
  const setupRunning = scriptState?.setupRunning ?? false
  const setupError = scriptState?.setupError ?? null

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [setupOutput])

  const getProjectAndWorktree = useCallback(() => {
    if (!worktreeId) return null
    const worktrees = useWorktreeStore.getState().worktreesByProject
    for (const [projectId, wts] of worktrees) {
      const wt = wts.find((w) => w.id === worktreeId)
      if (wt) {
        const project = useProjectStore.getState().projects.find((p) => p.id === projectId)
        return project ? { project, worktree: wt } : null
      }
    }
    return null
  }, [worktreeId])

  const handleRerunSetup = useCallback(() => {
    if (!worktreeId || setupRunning) return

    const info = getProjectAndWorktree()
    if (!info?.project?.setup_script) return

    useScriptStore.getState().clearSetupOutput(worktreeId)
    fireSetupScript(info.project.id, worktreeId, info.worktree.path)
  }, [worktreeId, setupRunning, getProjectAndWorktree])

  if (!worktreeId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
        {t('setupTab.empty.noWorktree')}
      </div>
    )
  }

  const info = getProjectAndWorktree()
  const hasSetupScript = !!info?.project?.setup_script

  // Determine status
  const isComplete = !setupRunning && setupOutput.length > 0 && !setupError
  const isFailed = !setupRunning && !!setupError

  return (
    <div className="flex h-full flex-col bg-transparent" data-testid="setup-tab">
      {/* Output area */}
      <div
        ref={outputRef}
        className="flex-1 min-h-0 overflow-auto px-3 py-2.5 font-mono text-[11px] leading-6"
        data-testid="setup-tab-output"
      >
        {setupOutput.length === 0 && !setupRunning && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-[260px] rounded-xl border border-dashed border-border/80 bg-background/72 px-4 py-4 text-center text-xs text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
              {hasSetupScript ? (
                t('setupTab.empty.noOutput')
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (info?.project)
                      useProjectStore.getState().openProjectSettings(info.project.id)
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {t('setupTab.empty.configure')}
                </Button>
              )}
            </div>
          </div>
        )}
        {setupOutput.map((line, i) => {
          if (line.startsWith('\x00CMD:')) {
            const cmd = line.slice(5)
            return (
              <div key={i} className="mt-1 font-semibold text-muted-foreground">
                $ {cmd}
              </div>
            )
          }
          if (line.startsWith('\x00ERR:')) {
            const msg = line.slice(5)
            return (
              <div key={i} className="text-destructive">
                {msg}
              </div>
            )
          }
          return (
            <div key={i} className="whitespace-pre-wrap break-all [&_code]:all-unset">
              <Ansi>{line}</Ansi>
            </div>
          )
        })}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-border/60 bg-background/72 px-3 py-2 text-xs">
        <div className="flex items-center gap-1.5">
          {setupRunning && (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="text-muted-foreground">{t('setupTab.status.running')}</span>
            </>
          )}
          {isComplete && (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span className="text-muted-foreground">{t('setupTab.status.complete')}</span>
            </>
          )}
          {isFailed && (
            <>
              <XCircle className="h-3 w-3 text-destructive" />
              <span className="text-destructive">{t('setupTab.status.failed')}</span>
            </>
          )}
        </div>

        {hasSetupScript && (
          <button
            onClick={handleRerunSetup}
            disabled={setupRunning}
            className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs transition-colors hover:border-border/70 hover:bg-background/80 disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="rerun-setup-button"
          >
            <RotateCcw className="h-3 w-3" />
            {t('setupTab.actions.rerun')}
          </button>
        )}
      </div>
    </div>
  )
}
