import { useNavigate } from 'react-router'
import { useCreateFolder } from './mutations'

export function EmptyHome() {
  const navigate = useNavigate()
  const createFolder = useCreateFolder()

  function start() {
    const id = crypto.randomUUID()
    createFolder.mutate(
      { id, parentId: null, name: 'Notes' },
      { onSuccess: () => navigate(`/folder/${id}`) },
    )
  }

  return (
    <section className="page">
      <div className="empty-state">
        <p>You don't have any folders yet.</p>
        <button className="button-primary" onClick={start}>
          Create a folder
        </button>
      </div>
    </section>
  )
}
