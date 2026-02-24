import { createEffect } from "solid-js"
import { useLayout } from "@/context/layout"
import { useNavigate } from "@solidjs/router"
import { base64Encode } from "@opencode-ai/util/encode"
import { useServer } from "@/context/server"
import { useGlobalSync } from "@/context/global-sync"

const PINNED_PROJECT = import.meta.env.VITE_OPENCODE_PROJECT as string | undefined

export default function Home() {
  const sync = useGlobalSync()
  const layout = useLayout()
  const navigate = useNavigate()
  const server = useServer()

  function openProject(directory: string) {
    layout.projects.open(directory)
    server.projects.touch(directory)
    navigate(`/${base64Encode(directory)}`, { replace: true })
  }

  createEffect(() => {
    // If a pinned project is configured, go straight to it
    if (PINNED_PROJECT) {
      openProject(PINNED_PROJECT)
      return
    }

    // Otherwise, auto-redirect to the most recently updated project
    const projects = sync.data.project
    if (projects.length === 0) return
    const first = projects
      .slice()
      .sort((a, b) => (b.time.updated ?? b.time.created) - (a.time.updated ?? a.time.created))[0]
    if (!first) return
    openProject(first.worktree)
  })

  return <div class="size-full" />
}
