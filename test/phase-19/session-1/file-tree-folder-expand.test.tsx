import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { VirtualFileTreeNode } from '@/components/file-tree/FileTreeNode'

describe('VirtualFileTreeNode folder expansion', () => {
  test('clicking a directory row toggles expansion in simplified files mode', async () => {
    const onToggle = vi.fn()

    render(
      <VirtualFileTreeNode
        node={{
          name: 'src',
          path: '/test-worktree/src',
          relativePath: 'src',
          isDirectory: true,
          extension: null
        }}
        depth={0}
        isExpanded={false}
        isFiltered={false}
        filter=""
        onToggle={onToggle}
        worktreePath="/test-worktree"
        gitStatusMap={new Map()}
        hideGitIndicators
        hideGitContextActions
      />
    )

    await userEvent.click(screen.getByRole('treeitem', { name: /folder: src/i }))

    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onToggle).toHaveBeenCalledWith('/test-worktree/src')
  })
})
