import Markdown, { defaultUrlTransform, type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { remarkWikiLinks, WIKI_PREFIX } from './remarkWikiLinks'
import './markdown.css'

const remarkPlugins = [remarkGfm, remarkWikiLinks]

const urlTransform = (url: string) => (url.startsWith(WIKI_PREFIX) ? url : defaultUrlTransform(url))

const components: Components = {
  a: ({ href, children, node: _node, ...props }) => {
    if (href?.startsWith(WIKI_PREFIX)) {
      return (
        <span className="wikilink" data-target={decodeURIComponent(href.slice(WIKI_PREFIX.length))}>
          {children}
        </span>
      )
    }
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
        {children}
      </a>
    )
  },
}

export function MarkdownContent({ source, className }: { source: string; className?: string }) {
  return (
    <div className={`prose ${className ?? ''}`}>
      <Markdown remarkPlugins={remarkPlugins} urlTransform={urlTransform} components={components}>
        {source}
      </Markdown>
    </div>
  )
}
