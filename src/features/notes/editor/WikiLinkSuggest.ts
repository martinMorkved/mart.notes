import { Extension } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react'
import { PluginKey } from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import { titleKey } from '@shared/wikiLinks'
import { type WikiLinkItem, WikiLinkMenu, type WikiLinkMenuHandle } from './WikiLinkMenu'

const MAX_ITEMS = 8

function suggestions(titles: string[], query: string): WikiLinkItem[] {
  const needle = titleKey(query)
  const matches = titles.filter((title) => titleKey(title).includes(needle))
  // Titles that start with what you typed come first, the rest keep newest first
  matches.sort((a, b) => Number(titleKey(b).startsWith(needle)) - Number(titleKey(a).startsWith(needle)))
  const items: WikiLinkItem[] = matches.slice(0, MAX_ITEMS).map((title) => ({ title, isNew: false }))
  if (needle && !matches.some((title) => titleKey(title) === needle)) items.push({ title: query.trim(), isNew: true })
  return items
}

// Typing [[ lists the other notes; picking one inserts a link to it
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
        items: ({ query, editor }) => suggestions(editor.storage.wikiLink.titles, query),
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              { type: 'wikiLink', attrs: { target: props.title } },
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
