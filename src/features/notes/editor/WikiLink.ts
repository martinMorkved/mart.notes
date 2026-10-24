import { InputRule, mergeAttributes, Node } from '@tiptap/core'

const WIKI_LINK = /^\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]/
const TYPED_WIKI_LINK = /\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]$/

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wikiLink: {
      insertWikiLink: (target: string) => ReturnType
    }
  }
}

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
