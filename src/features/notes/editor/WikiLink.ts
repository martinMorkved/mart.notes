import { InputRule, mergeAttributes, Node } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { titleKey } from '@shared/wikiLinks'

const WIKI_LINK = /^\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]/
const TYPED_WIKI_LINK = /\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]$/

export type WikiLinkStorage = {
  // titles of the other notes, newest first, for suggestions
  titles: string[]
  // their title keys, so links to anything else can look missing
  existing: Set<string>
  open: (target: string) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wikiLink: {
      insertWikiLink: (target: string) => ReturnType
    }
  }
  interface Storage {
    wikiLink: WikiLinkStorage
  }
}

// Set on a transaction after `existing` changes, so the missing marks are drawn again
export const wikiLinksChanged = new PluginKey('wikiLinksChanged')

// [[Target]] or [[Target|label]], kept as one unit so markdown round-trips without escaping
export const WikiLink = Node.create({
  name: 'wikiLink',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      target: { default: '' },
      label: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-wiki-link]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-wiki-link': node.attrs.target, class: 'wikilink' }),
      node.attrs.label ?? node.attrs.target,
    ]
  },

  renderText({ node }) {
    return node.attrs.label ?? node.attrs.target
  },

  markdownTokenizer: {
    name: 'wikiLink',
    level: 'inline',
    start: '[[',
    tokenize(src) {
      const match = WIKI_LINK.exec(src)
      if (!match) return
      return { type: 'wikiLink', raw: match[0], target: match[1].trim(), label: match[2]?.trim() }
    },
  },

  parseMarkdown(token) {
    return { type: 'wikiLink', attrs: { target: token.target, label: token.label ?? null } }
  },

  renderMarkdown(node) {
    const { target, label } = node.attrs ?? {}
    return label ? `[[${target}|${label}]]` : `[[${target}]]`
  },

  addStorage(): WikiLinkStorage {
    return { titles: [], existing: new Set(), open: () => {} }
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
              if (node.type.name === this.name && !storage.existing.has(titleKey(node.attrs.target))) {
                missing.push(Decoration.node(pos, pos + node.nodeSize, { class: 'wikilink-missing' }))
              }
            })
            return DecorationSet.create(state.doc, missing)
          },
          // A link is one unit you can't type inside, so a click follows it
          handleClickOn: (_view, _pos, node, _nodePos, event, direct) => {
            if (!direct || node.type.name !== this.name || event.button !== 0) return false
            storage.open(node.attrs.target)
            return true
          },
        },
      }),
    ]
  },

  addCommands() {
    return {
      insertWikiLink:
        (target) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { target } }),
    }
  },

  addInputRules() {
    return [
      new InputRule({
        find: TYPED_WIKI_LINK,
        handler: ({ state, range, match }) => {
          const node = this.type.create({ target: match[1].trim(), label: match[2]?.trim() ?? null })
          state.tr.replaceWith(range.from, range.to, node)
        },
      }),
    ]
  },
})
