import { markInputRule, markPasteRule } from '@tiptap/core'
import Italic from '@tiptap/extension-italic'

// Like markdown, *x* is only italic when the asterisks hug the text, so "3 * 4 * 5" stays as typed
const STAR = /(?:^|\s)(\*(?!\s)([^*]+?)(?<!\s)\*)$/
const UNDERSCORE = /(?:^|\s)(_(?!\s)([^_]+?)(?<!\s)_)$/
const STAR_PASTE = /(?:^|\s)(\*(?!\s)([^*]+?)(?<!\s)\*)/g
const UNDERSCORE_PASTE = /(?:^|\s)(_(?!\s)([^_]+?)(?<!\s)_)/g

export const StrictItalic = Italic.extend({
  addInputRules() {
    return [markInputRule({ find: STAR, type: this.type }), markInputRule({ find: UNDERSCORE, type: this.type })]
  },
  addPasteRules() {
    return [
      markPasteRule({ find: STAR_PASTE, type: this.type }),
      markPasteRule({ find: UNDERSCORE_PASTE, type: this.type }),
    ]
  },
})
