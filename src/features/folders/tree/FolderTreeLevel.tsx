import { FolderTreeItem } from './FolderTreeItem'
import { useFolderTree } from './FolderTreeContext'

export function FolderTreeLevel({ parentId, depth }: { parentId: string | null; depth: number }) {
  const { children, expanded } = useFolderTree()
  const folders = children.get(parentId) ?? []

  return (
    <ul role={depth === 0 ? 'tree' : 'group'} aria-label={depth === 0 ? 'Folders' : undefined}>
      {folders.map((folder) => (
        <FolderTreeItem key={folder.id} folder={folder} depth={depth}>
          {children.get(folder.id)?.length && expanded.has(folder.id) ? (
            <FolderTreeLevel parentId={folder.id} depth={depth + 1} />
          ) : null}
        </FolderTreeItem>
      ))}
    </ul>
  )
}
