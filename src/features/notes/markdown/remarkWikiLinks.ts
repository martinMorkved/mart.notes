import type { PhrasingContent, Root } from 'mdast'
import { SKIP, visit } from 'unist-util-visit'

const WIKI_LINK = /\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]/g

export const WIKI_PREFIX = 'wiki:'

// Turns [[Target]] and [[Target|label]] into links with a wiki: url, so the renderer can resolve them
export function remarkWikiLinks() {
  return (tree: Root) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined || !node.value.includes('[[')) return

      const parts: PhrasingContent[] = []
      let last = 0
      for (const match of node.value.matchAll(WIKI_LINK)) {
        const [raw, target, label] = match
        if (match.index > last) parts.push({ type: 'text', value: node.value.slice(last, match.index) })
        parts.push({
          type: 'link',
          url: WIKI_PREFIX + target.trim(),
          children: [{ type: 'text', value: (label ?? target).trim() }],
        })
        last = match.index + raw.length
      }
      if (!parts.length) return
      if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) })

      ;(parent.children as PhrasingContent[]).splice(index, 1, ...parts)
      return [SKIP, index + parts.length]
    })
  }
}
