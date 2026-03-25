import React, { useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { THEME } from '@/core/constants/theme'
import type { RichTextEditorProps } from '@/core/types/form.types'
import { cleanHtml } from '@/core/utils/comman'

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

  // ✅ INIT QUILL
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const quill = new Quill(el, {
      theme: 'snow',
      placeholder,
      readOnly,
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

    // ✅ SET INITIAL VALUE
    if (value) {
      quill.clipboard.dangerouslyPasteHTML(cleanHtml(value))
    }

    // ✅ DEBOUNCED CHANGE HANDLER
    let timeout: any

    const handler = () => {
      clearTimeout(timeout)

      timeout = setTimeout(() => {
        const html = quill.root.innerHTML

        const isEmpty =
          !html || html.replace(/<(.|\n)*?>/g, '').trim() === ''

        const cleaned = cleanHtml(isEmpty ? '' : html)

        onChange(cleaned)
      }, 200)
    }

    quill.on('text-change', handler)

    return () => {
      quill.off('text-change', handler)
      quillRef.current = null
      el.innerHTML = ''
    }
  }, [])

  // ✅ SYNC VALUE (FIXED)
  useEffect(() => {
    const quill = quillRef.current
    if (!quill) return

    const currentHtml =
      quill.root.innerHTML === '<p><br></p>' ? '' : quill.root.innerHTML

    const cleanedValue = cleanHtml(value || '')

    if (currentHtml !== cleanedValue) {
      const range = quill.getSelection()

      quill.setContents([]) // safer reset
      quill.clipboard.dangerouslyPasteHTML(cleanedValue)

      if (range) {
        quill.setSelection(range)
      }
    }
  }, [value])

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-[#3333334f] ${className}`}
      style={{ width: '100%', marginBottom: theme.spacing.sm }}
      data-name={name}
    >
      <div ref={containerRef} />

      {(error || helperText) && (
        <div
          style={{
            marginTop: theme.spacing.sm,
            fontSize: theme.fontSize.sm,
            color: error
              ? theme.colors.error
              : theme.colors.textSecondary,
          }}
        >
          {error || helperText}
        </div>
      )}
    </div>
  )
}

export default RichTextEditor