import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { SessionTaskTracker } from '@/components/sessions/SessionTaskTracker'

describe('SessionTaskTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers()
    })
    vi.useRealTimers()
  })

  test('is collapsed to summary-only by default', () => {
    render(
      <SessionTaskTracker
        toolStatus="running"
        todos={[
          {
            id: 'task-1',
            content: '探索项目结构',
            status: 'in_progress',
            priority: 'medium'
          },
          {
            id: 'task-2',
            content: '分析现有图标样式实现',
            status: 'pending',
            priority: 'medium'
          }
        ]}
      />
    )

    expect(screen.getByText('2 tasks, 0 completed')).toBeInTheDocument()
    expect(screen.queryByText('探索项目结构')).not.toBeInTheDocument()
    expect(screen.queryByText('分析现有图标样式实现')).not.toBeInTheDocument()
  })

  test('shows newly completed todo with completion styling while expanded', () => {
    const { rerender } = render(
      <SessionTaskTracker
        toolStatus="running"
        todos={[
          {
            id: 'task-1',
            content: '探索项目结构',
            status: 'in_progress',
            priority: 'medium'
          },
          {
            id: 'task-2',
            content: '分析现有图标样式实现',
            status: 'pending',
            priority: 'medium'
          },
          {
            id: 'task-3',
            content: '优化文件树图标样式',
            status: 'pending',
            priority: 'medium'
          }
        ]}
      />
    )

    act(() => {
      fireEvent.click(screen.getByLabelText(/expand tasks/i))
    })

    act(() => {
      rerender(
        <SessionTaskTracker
          toolStatus="running"
          todos={[
            {
              id: 'task-1',
              content: '探索项目结构',
              status: 'completed',
              priority: 'medium'
            },
            {
              id: 'task-2',
              content: '分析现有图标样式实现',
              status: 'pending',
              priority: 'medium'
            },
            {
              id: 'task-3',
              content: '优化文件树图标样式',
              status: 'pending',
              priority: 'medium'
            }
          ]}
        />
      )
    })

    const completedTodo = screen.getByText('探索项目结构')
    expect(completedTodo).toBeInTheDocument()
    expect(completedTodo).toHaveClass('line-through')
  })
})
