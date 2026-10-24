import { InputRule, mergeAttributes, Node } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { NoteTitle } from '@shared/types'
import { NOTE_LINK, noteLinkMarkdown, TITLE_LINK, titleKey } from '@shared/wikiLinks'

const TYPED_TITLE_LINK = new RegExp(`${TITLE_LINK.source.slice(1)}$`)

// A link has either a noteId (the normal case) or only a target title ([[Title]] typed by hand)
export type WikiLinkAttrs = { noteId: string | null; label: string | null; target: string | null }

export type WikiLinkStorage = {
  // every live note, newest first
  notes: NoteTitle[]
  byId: Map<string, string>
  // title key → id, for [[Title]] links
  byKey: Map<string, string>
  currentId: string | null
  open: (attrs: WikiLinkAttrs) => void
  // makes a note with this title and returns its id
  create: (title: string) => string
}

declare module '@tiptap/core' {
  interface Storage {
    wikiLink: WikiLinkStorage
  }
}

// Set on a transaction after the storage changes, so the missing marks are drawn again
export const wikiLinksChanged = new PluginKey('wikiLinksChanged')

export const displayTitle = (title: string) => title.trim() || 'Untitled'

// The attributes for a link to `text`: to the note with that title if there is one
export function linkTo(storage: WikiLinkStorage, text: string): WikiLinkAttrs {
  const noteId = storage.byKey.get(titleKey(text))
  if (noteId) return { noteId, label: displayTitle(storage.byId.get(noteId) ?? text), target: null }
  return { noteId: null, label: null, target: text.trim() }
}

function isMissing(storage: WikiLinkStorage, attrs: WikiLinkAttrs) {
  return attrs.noteId ? !storage.byId.has(attrs.noteId) : !storage.byKey.has(titleKey(attrs.target ?? ''))
}

// Kept as one unit, so the markdown round-trips without escaping
export const WikiLink = Node.create({
  name: 'wikiLink',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      noteId: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-note-id'),
        renderHTML: (attrs) => (attrs.noteId ? { 'data-note-id': attrs.noteId } : {}),
      },
      label: { default: null, parseHTML: (el) => el.textContent, renderHTML: () => ({}) },
      target: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-target'),
        renderHTML: (attrs) => (attrs.target ? { 'data-target': attrs.target } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-wiki-link]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-wiki-link': '', class: 'wikilink' }),
      node.attrs.label ?? node.attrs.target,
    ]
  },

  renderText({ node }) {
    return node.attrs.label ?? node.attrs.target
  },

  markdownTokenizer: {
    name: 'wikiLink',
    level: 'inline',
    start: '[',
    tokenize(src) {
      const link = NOTE_LINK.exec(src)
      if (link) return { type: 'wikiLink', raw: link[0], noteId: link[2], label: link[1] }
      const title = TITLE_LINK.exec(src)
      if (title) return { type: 'wikiLink', raw: title[0], target: title[1].trim(), label: title[2]?.trim() }
    },
  },

  parseMarkdown(token) {
    return {
      type: 'wikiLink',
      attrs: { noteId: token.noteId ?? null, label: token.label ?? null, target: token.target ?? null },
    }
  },

  renderMarkdown(node) {
    const { noteId, label, target } = (node.attrs ?? {}) as WikiLinkAttrs
    if (noteId) return noteLinkMarkdown(noteId, label || 'Untitled')
    return label ? `[[${target}|${label}]]` : `[[${target}]]`
  },

  addStorage(): WikiLinkStorage {
    return {
      notes: [],
      byId: new Map(),
      byKey: new Map(),
      currentId: null,
      open: () => {},
      create: () => '',
    }
  },

  addProseMirrorPlugins() {
    const storage = this.storage
    return [
      new Plugin({
        key: wikiLinksChanged,
        props: {
          decorations: (state) => {
            const missing: Decoration[] = []
            state.doc.descendants((node, pos) => {
              if (node.type.name === this.name && isMissing(storage, node.attrs as WikiLinkAttrs)) {
                missing.push(Decoration.node(pos, pos + node.nodeSize, { class: 'wikilink-missing' }))
              }
            })
            return DecorationSet.create(state.doc, missing)
          },
          // A link is one unit you can't type inside, so a click follows it
          handleClickOn: (_view, _pos, node, _nodePos, event, direct) => {
            if (!direct || node.type.name !== this.name || event.button !== 0) return false
            storage.open(node.attrs as WikiLinkAttrs)
            return true
          },
        },
      }),
    ]
  },

  addInputRules() {
    return [
      new InputRule({
        find: TYPED_TITLE_LINK,
        handler: ({ state, range, match }) => {
          state.tr.replaceWith(range.from, range.to, this.type.create(linkTo(this.storage, match[1])))
        },
      }),
    ]
  },
})
