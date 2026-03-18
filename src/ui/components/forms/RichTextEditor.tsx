import React, { useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { THEME } from '@/core/constants/theme'
import type { RichTextEditorProps } from '@/core/types/form.types'

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  name,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  className,
  readOnly = false,
}) => {
  const theme = THEME
  const containerRef = useRef<HTMLDivElement | null>(null)
  const quillRef = useRef<Quill | null>(null)

  // Init Quill (StrictMode-safe)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const quill = new Quill(el, {
      theme: 'snow',
      placeholder,
      readOnly: readOnly,
      modules: readOnly
        ? { toolbar: false }            
        : {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ size: [] }],
            [{ font: [] }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean'],
          ],
        },
    })

    quillRef.current = quill

    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value)
    }

    const handler = () => {
      const html = quill.root.innerHTML
      const normalized = html === '<p><br></p>' ? '' : html
      onChange(normalized)
    }

    quill.on('text-change', handler)

    return () => {
      quill.off('text-change', handler)
      quillRef.current = null
      el.innerHTML = ''
    }
  }, []) 

  useEffect(() => {
    const quill = quillRef.current
    if (!quill) return

    const editorHtml = quill.root.innerHTML
    const normalizedEditor = editorHtml === '<p><br></p>' ? '' : editorHtml
    if (normalizedEditor === value) return

    const selection = quill.getSelection()
    quill.clipboard.dangerouslyPasteHTML(value || '')
    if (selection) {
      quill.setSelection(selection)
    }
  }, [value])

  return (
    <div
      className={className}
      style={{ width: '100%', marginBottom: theme.spacing.sm }}
      data-name={name}
    >
      <div ref={containerRef} />

      {(error || helperText) && (
        <div
          style={{
            marginTop: theme.spacing.sm,
            fontSize: theme.fontSize.sm,
            color: error ? theme.colors.error : theme.colors.textSecondary,
          }}
        >
          {error || helperText}
        </div>
      )}
    </div>
  )
}

export default RichTextEditor
