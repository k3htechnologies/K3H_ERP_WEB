import type { RichTextEditorProps } from '@/core/types/form.types'
import React, { useEffect, useRef } from 'react'

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  className,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const isInternalUpdate = useRef(false)

  // Sync external value -> editor
  useEffect(() => {
    const el = editorRef.current
    if (!el) return

    if (isInternalUpdate.current) {
      // skip setting innerHTML when change came from onInput
      isInternalUpdate.current = false
      return
    }

    if (value !== el.innerHTML) {
      el.innerHTML = value || ''
    }
  }, [value])

  const exec = (command: string, value?: string) => {
    // basic browser rich text API
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML
    isInternalUpdate.current = true
    onChange(html)
  }

  const handleCreateLink = () => {
    const url = window.prompt('Enter URL')
    if (!url) return
    exec('createLink', url)
  }

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-gray-200 bg-gray-50 px-2 py-1">
        {/* left group */}
        <div className="flex gap-1">
          <button
            type="button"
            className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-white"
            onClick={() => exec('bold')}
          >
            <b>B</b>
          </button>
          <button
            type="button"
            className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-white italic"
            onClick={() => exec('italic')}
          >
            I
          </button>
          <button
            type="button"
            className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-white underline"
            onClick={() => exec('underline')}
          >
            U
          </button>
        </div>

        {/* block type */}
        <div className="flex gap-1 ml-2">
          <button
            type="button"
            className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-white"
            onClick={() => exec('formatBlock', 'p')}
          >
            P
          </button>
          <button
            type="button"
            className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-white"
            onClick={() => exec('formatBlock', 'h2')}
          >
            H2
          </button>
        </div>

        {/* lists */}
        <div className="flex gap-1 ml-2">
          <button
            type="button"
            className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-white"
            onClick={() => exec('insertUnorderedList')}
          >
            • List
          </button>
          <button
            type="button"
            className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-white"
            onClick={() => exec('insertOrderedList')}
          >
            1. List
          </button>
        </div>

        {/* link */}
        <div className="flex gap-1 ml-2">
          <button
            type="button"
            className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-white"
            onClick={handleCreateLink}
          >
            Link
          </button>
        </div>

        {/* undo / redo */}
        <div className="flex gap-1 ml-auto">
          <button
            type="button"
            className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-white"
            onClick={() => exec('undo')}
          >
            Undo
          </button>
          <button
            type="button"
            className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-white"
            onClick={() => exec('redo')}
          >
            Redo
          </button>
        </div>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className={`
          min-h-[160px] rounded-b-md border border-t-0 border-gray-200 
          bg-white px-3 py-2 text-sm leading-relaxed outline-none
          focus-visible:ring-1 focus-visible:ring-blue-500
        `}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  )
}

export default RichTextEditor
