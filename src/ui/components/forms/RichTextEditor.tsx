import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { THEME } from '@/core/constants/theme';
import type { RichTextEditorProps } from '@/core/types/form.types';

const normalizeEditorHtml = (html: string): string => {
  const container = document.createElement('div');
  container.innerHTML = html;

  container.querySelectorAll('p').forEach((paragraph) => {
    // Remove leading spaces used to position text.
    if (!paragraph.classList.contains('ql-align-center') &&
        !paragraph.classList.contains('ql-align-right') &&
        !paragraph.classList.contains('ql-align-justify')) {
      paragraph.innerHTML = paragraph.innerHTML.replace(
        /^[\s\u00a0]+/,
        ''
      );
    }
  });

  return container.innerHTML;
};

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
  const theme = THEME;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  const isInternalChange = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const quill = new Quill(element, {
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
    });

    quillRef.current = quill;
    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value, 'silent');
    }

    const handler = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      isInternalChange.current = true;

      timeoutRef.current = setTimeout(() => {
        const html = quill.root.innerHTML;
        const text = quill.getText().trim();
        onChangeRef.current(text ? normalizeEditorHtml(html) : '');
        isInternalChange.current = false;
      }, 200);
    };

    quill.on('text-change', handler);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      quill.off('text-change', handler);
      quillRef.current = null;
      element.innerHTML = '';
    };
  }, []);
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || isInternalChange.current) return;

    const incomingHtml = value || '';
    const currentHtml = quill.root.innerHTML;
    if (currentHtml === incomingHtml) return;
    const selection = quill.getSelection();

    quill.clipboard.dangerouslyPasteHTML(incomingHtml, 'silent');

    if (selection) {
      const maxIndex = Math.max(0, quill.getLength() - 1);
      const index = Math.min(selection.index, maxIndex);
      const length = Math.min(selection.length, maxIndex - index);

      quill.setSelection(index, length, 'silent');
    }
  }, [value]);

  return (
    <div
      className={`rich-text-editor bg-white rounded-xl shadow-sm border border-[#3333334f] ${className ?? ''}`}
      style={{
        width: '100%',
        marginBottom: theme.spacing.sm,
      }}
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
  );
};

export default RichTextEditor;