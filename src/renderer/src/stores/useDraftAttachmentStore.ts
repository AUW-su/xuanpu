import { create } from 'zustand'
import type { Attachment } from '@/components/sessions/AttachmentPreview'

interface DraftAttachmentState {
  /** Per-session draft attachments, keyed by session ID */
  drafts: Map<string, Attachment[]>
  save: (sessionId: string, attachments: Attachment[]) => void
  restore: (sessionId: string) => Attachment[]
  clear: (sessionId: string) => void
}

export const useDraftAttachmentStore = create<DraftAttachmentState>((set, get) => ({
  drafts: new Map(),
  save: (sessionId, attachments) =>
    set((state) => {
      const drafts = new Map(state.drafts)
      if (attachments.length > 0) {
        drafts.set(sessionId, attachments)
      } else {
        drafts.delete(sessionId)
      }
      return { drafts }
    }),
  restore: (sessionId) => get().drafts.get(sessionId) ?? [],
  clear: (sessionId) =>
    set((state) => {
      const drafts = new Map(state.drafts)
      drafts.delete(sessionId)
      return { drafts }
    })
}))
