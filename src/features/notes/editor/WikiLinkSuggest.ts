import { Extension } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react'
import { PluginKey } from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import { titleKey } from '@shared/wikiLinks'
import { displayTitle, type WikiLinkStorage } from './WikiLink'
import { type WikiLinkItem, WikiLinkMenu, type WikiLinkMenuHandle } from './WikiLinkMenu'

const MAX_ITEMS = 8

function suggestions(storage: WikiLinkStorage, query: string): WikiLinkItem[] {
  const needle = titleKey(query)
  const matches = storage.notes.filter(
    (n) => n.id !== storage.currentId && titleKey(n.title) && titleKey(n.title).includes(needle),
  )
  // Titles that start with what you typed come first, the rest keep newest first
  const starts = (title: string) => Number(titleKey(title).startsWith(needle))
  matches.sort((a, b) => starts(b.title) - starts(a.title))
  const items: WikiLinkItem[] = matches.slice(0, MAX_ITEMS).map((n) => ({ id: n.id, title: n.title }))
  if (needle && !matches.some((n) => titleKey(n.title) === needle)) items.push({ id: null, title: query.trim() })
  return items
}

// Typing [[ lists the other notes; picking one inserts a link to it, or makes a new note to link to
export const WikiLinkSuggest = Extension.create({
  name: 'wikiLinkSuggest',
  // ahead of the list and table keymaps, so Enter picks a note instead of splitting a line
  priority: 200,

  addProseMirrorPlugins() {
    return [
      Suggestion<WikiLinkItem, WikiLinkItem>({
        editor: this.editor,
        pluginKey: new PluginKey('wikiLinkSuggest'),
        char: '[[',
        allowSpaces: true,
        allowedPrefixes: null,
        items: ({ query, editor }) => suggestions(editor.storage.wikiLink, query),
        command: ({ editor, range, props }) => {
          const noteId = props.id ?? editor.storage.wikiLink.create(props.title)
          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              { type: 'wikiLink', attrs: { noteId, label: displayTitle(props.title), target: null } },
              { type: 'text', text: ' ' },
            ])
            .run()
        },
        render: () => {
          let menu: ReactRenderer<WikiLinkMenuHandle> | undefined
          let unmount: (() => void) | undefined
          return {
            onStart: (props) => {
              menu = new ReactRenderer(WikiLinkMenu, { props, editor: props.editor })
              unmount = props.mount(menu.element as HTMLElement)
            },
            onUpdate: (props) => menu?.updateProps(props),
            onKeyDown: ({ event }) => menu?.ref?.onKeyDown(event) ?? false,
            onExit: () => {
              unmount?.()
              menu?.destroy()
            },
          }
        },
      }),
    ]
  },
})
