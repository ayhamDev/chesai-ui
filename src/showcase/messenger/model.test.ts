import { describe, expect, it } from 'vitest'
import { filterConversations, initialConversations, updateConversation } from './model'

describe('messenger conversations', () => {
  it('moves recently active conversations up without displacing pinned chats', () => {
    const updated = updateConversation(initialConversations, 'robert', c => ({ ...c, updatedAt: 1 }))
    expect(
      filterConversations(updated, '', 'All', false)
        .slice(0, 3)
        .map(c => c.id),
    ).toEqual(['jenny', 'studio', 'robert'])
  })
  it('combines category, unread and message-content searches', () => {
    expect(filterConversations(initialConversations, '  PLAYLIST ', 'Personal', true).map(c => c.id)).toEqual(['jenny'])
    expect(filterConversations(initialConversations, 'playlist', 'Groups', true)).toEqual([])
    expect(filterConversations(initialConversations, '', 'Channels', true).map(c => c.id)).toEqual(['material'])
  })
  it('keeps pinned conversations first without mutating the source list', () => {
    const original = initialConversations.map(c => c.id)
    expect(
      filterConversations(initialConversations, '', 'All', false)
        .slice(0, 2)
        .map(c => c.id),
    ).toEqual(['jenny', 'studio'])
    expect(initialConversations.map(c => c.id)).toEqual(original)
  })
  it('updates only the target conversation, preserving other messages and unread counts', () => {
    const updated = updateConversation(initialConversations, 'jenny', c => ({
      ...c,
      unread: 0,
      messages: [...c.messages, { id: 'new', text: 'See you there', own: true, time: 'Now' }],
    }))
    expect(updated[0].messages.at(-1)?.text).toBe('See you there')
    expect(updated[0].unread).toBe(0)
    expect(updated[1]).toBe(initialConversations[1])
    expect(initialConversations[0].unread).toBe(2)
    expect(initialConversations[0].messages.at(-1)?.id).toBe('j7')
  })
})
