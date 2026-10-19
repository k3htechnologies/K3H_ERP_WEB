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
  const lastHtmlRef = useRef<string>('')

  // ✅ INIT QUILL
  useEffect(() => {
    const wrapper = containerRef.current
    if (!wrapper) return

    // Toolbar is inserted as a sibling of the mount node, so mount on a child
    // and clear the whole wrapper on cleanup (avoids duplicate toolbars in StrictMode)
    const el = document.createElement('div')
    wrapper.appendChild(el)

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
            [{ indent: '-1' }, { indent: '+1' }],
            ['clean'],
          ],
          keyboard: {
            bindings: {
              tab: {
                key: 'Tab',
                handler: (range: any, context: any) => {
                  if (context?.format?.table) {
                    return true
                  }
                  quill.insertText(range.index, '\u00a0\u00a0\u00a0\u00a0', 'user')
                  quill.setSelection(range.index + 4, 'silent')
                  return false
                },
              },
            },
          },
        },
    })

    quillRef.current = quill

    if (value) {
      const cleaned = cleanHtml(value)
      lastHtmlRef.current = cleaned
      quill.clipboard.dangerouslyPasteHTML(cleaned)
      quill.blur()
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
        lastHtmlRef.current = cleaned

        onChange(cleaned)
      }, 200)
    }

    quill.on('text-change', handler)

    return () => {
      quill.off('text-change', handler)
      quillRef.current = null
      wrapper.innerHTML = ''
    }
  }, [])

  // ✅ SYNC VALUE (FIXED)
  useEffect(() => {
    const quill = quillRef.current
    if (!quill) return

    // Skip re-pasting if the value update originated from our own change handler
    if (value === lastHtmlRef.current) return

    const currentHtml =
      quill.root.innerHTML === '<p><br></p>' ? '' : quill.root.innerHTML

    const cleanedValue = cleanHtml(value || '')

    if (currentHtml !== cleanedValue) {
      lastHtmlRef.current = cleanedValue
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