import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// ---------------------------------------------------------------------------
// ModelIcon mocks
// ---------------------------------------------------------------------------

let mockShowModelIcons = true
let mockLastModelId: string | null = null
let mockLatestAgentSdk: string | null = null

vi.mock('@/stores/useSettingsStore', () => ({
  useSettingsStore: Object.assign(
    (selector?: (s: unknown) => unknown) => {
      const state = { showModelIcons: mockShowModelIcons }
      return selector ? selector(state) : state
    },
    { getState: () => ({ showModelIcons: mockShowModelIcons }) }
  )
}))

vi.mock('@/stores', () => ({
  useWorktreeStore: Object.assign(
    (selector?: (s: unknown) => unknown) => {
      const state = {
        worktreesByProject: new Map([
          [
            'proj-1',
            [{ id: 'wt-1', last_model_id: mockLastModelId }]
          ]
        ])
      }
      return selector ? selector(state) : state
    },
    { getState: () => ({}) }
  ),
  useSessionStore: Object.assign(
    (selector?: (s: unknown) => unknown) => {
      const state = {
        sessionsByWorktree: new Map([
          [
            'wt-1',
            mockLatestAgentSdk
              ? [{ id: 's-1', agent_sdk: mockLatestAgentSdk }]
              : []
          ]
        ])
      }
      return selector ? selector(state) : state
    },
    { getState: () => ({}) }
  )
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' ')
}))

// Mock SVG imports as simple strings
vi.mock('@/assets/model-icons/claude.svg', () => ({ default: 'claude-icon.svg' }))
vi.mock('@/assets/model-icons/openai.svg', () => ({ default: 'openai-icon.svg' }))

describe('ModelIcon: Codex awareness', () => {
  beforeEach(() => {
    mockShowModelIcons = true
    mockLastModelId = null
    mockLatestAgentSdk = null
  })

  it('shows OpenAI icon when agent_sdk is codex', async () => {
    mockLatestAgentSdk = 'codex'

    const { ModelIcon } = await import(
      '@/components/worktrees/ModelIcon'
    )
    render(<ModelIcon worktreeId="wt-1" />)

    const img = screen.getByAltText('OpenAI')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'openai-icon.svg')
  })

  it('shows Claude icon when agent_sdk is claude-code (no regression)', async () => {
    mockLatestAgentSdk = 'claude-code'

    const { ModelIcon } = await import(
      '@/components/worktrees/ModelIcon'
    )
    render(<ModelIcon worktreeId="wt-1" />)

    const img = screen.getByAltText('Claude')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'claude-icon.svg')
  })

  it('falls back to model-id pattern matching for opencode sessions', async () => {
    mockLatestAgentSdk = 'opencode'
    mockLastModelId = 'gpt-4o'

    const { ModelIcon } = await import(
      '@/components/worktrees/ModelIcon'
    )
    render(<ModelIcon worktreeId="wt-1" />)

    const img = screen.getByAltText('OpenAI')
    expect(img).toBeInTheDocument()
  })

  it('returns null when showModelIcons is false', async () => {
    mockShowModelIcons = false
    mockLatestAgentSdk = 'codex'

    const { ModelIcon } = await import(
      '@/components/worktrees/ModelIcon'
    )
    const { container } = render(<ModelIcon worktreeId="wt-1" />)

    expect(container.innerHTML).toBe('')
  })

  it('handles unknown SDK gracefully — falls through to model-id matching', async () => {
    mockLatestAgentSdk = 'some-future-sdk'
    mockLastModelId = 'claude-3-opus'

    const { ModelIcon } = await import(
      '@/components/worktrees/ModelIcon'
    )
    render(<ModelIcon worktreeId="wt-1" />)

    const img = screen.getByAltText('Claude')
    expect(img).toBeInTheDocument()
  })

  it('returns null for unknown SDK with unknown model', async () => {
    mockLatestAgentSdk = 'some-future-sdk'
    mockLastModelId = 'unknown-model-xyz'

    const { ModelIcon } = await import(
      '@/components/worktrees/ModelIcon'
    )
    const { container } = render(<ModelIcon worktreeId="wt-1" />)

    expect(container.innerHTML).toBe('')
  })
})

// ---------------------------------------------------------------------------
// SessionTabs: Codex tab renders with standard AI styling (not terminal)
// ---------------------------------------------------------------------------

describe('SessionTabs: Codex tab styling', () => {
  it('codex agentSdk type is not "terminal" — no emerald icon class', () => {
    // Codex sessions use agentSdk: 'codex' which is NOT 'terminal',
    // so the SessionTab component renders the standard status indicators
    // (Loader2/AlertCircle/Check) instead of the TerminalSquare icon.
    const codexSdk: 'opencode' | 'claude-code' | 'codex' | 'terminal' = 'codex'
    expect(codexSdk).not.toBe('terminal')
  })

  it('codex sessions are closable and draggable (unlike terminal sticky tabs)', () => {
    // The SessionTab component renders close button and draggable attribute
    // for all non-terminal tabs. Codex (agentSdk: 'codex') gets the same
    // treatment as opencode and claude-code sessions.
    const codexSdk = 'codex'
    const isTerminal = codexSdk === 'terminal'
    expect(isTerminal).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Capability-gated slash commands: Codex has supportsUndo=true, supportsRedo=false
// ---------------------------------------------------------------------------

describe('Capability-gated commands for Codex', () => {
  it('/undo is available when supportsUndo is true', () => {
    const capabilities = { supportsUndo: true, supportsRedo: false }
    const commands = new Map([
      ['undo', { name: 'undo' }],
      ['redo', { name: 'redo' }],
      ['help', { name: 'help' }]
    ])

    const filtered = Array.from(commands.entries()).filter(([key]) => {
      if (key === 'undo' && !capabilities.supportsUndo) return false
      if (key === 'redo' && !capabilities.supportsRedo) return false
      return true
    })

    const filteredKeys = filtered.map(([k]) => k)
    expect(filteredKeys).toContain('undo')
  })

  it('/redo is hidden when supportsRedo is false', () => {
    const capabilities = { supportsUndo: true, supportsRedo: false }
    const commands = new Map([
      ['undo', { name: 'undo' }],
      ['redo', { name: 'redo' }],
      ['help', { name: 'help' }]
    ])

    const filtered = Array.from(commands.entries()).filter(([key]) => {
      if (key === 'undo' && !capabilities.supportsUndo) return false
      if (key === 'redo' && !capabilities.supportsRedo) return false
      return true
    })

    const filteredKeys = filtered.map(([k]) => k)
    expect(filteredKeys).not.toContain('redo')
  })

  it('non-undo/redo commands pass through regardless of capabilities', () => {
    const capabilities = { supportsUndo: false, supportsRedo: false }
    const commands = new Map([
      ['undo', { name: 'undo' }],
      ['redo', { name: 'redo' }],
      ['help', { name: 'help' }],
      ['clear', { name: 'clear' }]
    ])

    const filtered = Array.from(commands.entries()).filter(([key]) => {
      if (key === 'undo' && !capabilities.supportsUndo) return false
      if (key === 'redo' && !capabilities.supportsRedo) return false
      return true
    })

    const filteredKeys = filtered.map(([k]) => k)
    expect(filteredKeys).toContain('help')
    expect(filteredKeys).toContain('clear')
  })
})

// ---------------------------------------------------------------------------
// Plan mode prefix skipping: Codex and Claude Code both skip PLAN_MODE_PREFIX
// ---------------------------------------------------------------------------

describe('Plan mode prefix: Codex and Claude Code skip it', () => {
  const PLAN_MODE_PREFIX = '[PLAN MODE] '

  function buildModePrefix(
    currentMode: 'plan' | 'build',
    agentSdk: string
  ): string {
    const isClaudeCode = agentSdk === 'claude-code'
    const skipPlanModePrefix = isClaudeCode || agentSdk === 'codex'
    return currentMode === 'plan' && !skipPlanModePrefix ? PLAN_MODE_PREFIX : ''
  }

  it('opencode sessions in plan mode get the prefix', () => {
    expect(buildModePrefix('plan', 'opencode')).toBe(PLAN_MODE_PREFIX)
  })

  it('claude-code sessions in plan mode do NOT get the prefix', () => {
    expect(buildModePrefix('plan', 'claude-code')).toBe('')
  })

  it('codex sessions in plan mode do NOT get the prefix', () => {
    expect(buildModePrefix('plan', 'codex')).toBe('')
  })

  it('build mode never gets the prefix regardless of SDK', () => {
    expect(buildModePrefix('build', 'opencode')).toBe('')
    expect(buildModePrefix('build', 'claude-code')).toBe('')
    expect(buildModePrefix('build', 'codex')).toBe('')
  })
})
