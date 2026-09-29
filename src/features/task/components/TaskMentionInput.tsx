import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import { getNameInitials } from '@/core/utils/getNameInitials';
import useToast from '@/core/hooks/useToast';
import type { TaskMentionUser } from '@/features/task/models/TaskDiscussionModel';
import { ALLOWED_ATTACHMENT_TYPES, MAX_ATTACHMENT_FILES, MAX_ATTACHMENT_SIZE_MB } from '@/features/task/constants/taskConstants';
import { findActiveMentionQuery, insertMention } from '@/features/task/utils/taskDiscussionUtils';
import { Button } from '@/ui/components/forms/Button';
import { Input } from '@/ui/components/forms';

interface TaskMentionInputProps {
    users: TaskMentionUser[];
    placeholder?: string;
    disabled?: boolean;
    onSubmit?: (text: string, files: File[]) => void;
}

export const TaskMentionInput: React.FC<TaskMentionInputProps> = ({
    users,
    placeholder = 'Add a comment or @mention someone...',
    disabled = false,
    onSubmit,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mentionListRef = useRef<HTMLDivElement>(null);
    const composerRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState('');
    const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
    const [mentionQuery, setMentionQuery] = useState('');
    const [showMentionList, setShowMentionList] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const { addToast } = useToast();

    const canSubmit = value.trim().length > 0 || attachmentFiles.length > 0;

    const filteredUsers = useMemo(() => {
        const query = mentionQuery.trim().toLowerCase();

        if (!query) return users;

        return users.filter((user) =>
            user.name.toLowerCase().includes(query),
        );
    }, [mentionQuery, users]);

    const syncMentionState = useCallback((nextValue: string, nextCursor: number) => {
        const activeMention = findActiveMentionQuery(nextValue, nextCursor);

        if (activeMention) {
            setMentionStartIndex(activeMention.startIndex);
            setMentionQuery(activeMention.query);
            setShowMentionList(true);
        } else {
            setMentionStartIndex(null);
            setMentionQuery('');
            setShowMentionList(false);
            setHighlightedIndex(0);
        }
    }, []);

    useEffect(() => {
        if (showMentionList) {
            setHighlightedIndex(0);
        }
    }, [mentionQuery, mentionStartIndex, showMentionList]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextValue = event.target.value;
        const nextCursor = event.target.selectionStart ?? nextValue.length;

        setValue(nextValue);
        setCursorPosition(nextCursor);
        syncMentionState(nextValue, nextCursor);
    };

    const handleSelectUser = (user: TaskMentionUser) => {
        if (mentionStartIndex === null) return;

        const { value: nextValue, cursor } = insertMention(
            value,
            mentionStartIndex,
            cursorPosition,
            user.name,
        );

        setValue(nextValue);
        setCursorPosition(cursor);
        setShowMentionList(false);
        setMentionStartIndex(null);
        setMentionQuery('');

        requestAnimationFrame(() => {
            const input = inputRef.current;
            if (!input) return;

            input.focus();
            input.setSelectionRange(cursor, cursor);
        });
    };

    const handleSubmit = () => {
        if (!canSubmit || disabled) return;

        onSubmit?.(value.trim(), attachmentFiles);
    };

    const handleAttachmentClick = () => {
        if (disabled) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        if (selectedFiles.length === 0) return;

        const maxBytes = MAX_ATTACHMENT_SIZE_MB * 1024 * 1024;
        const validFiles: File[] = [];

        selectedFiles.forEach((file) => {
            if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
                addToast({
                    type: 'error',
                    title: `${file.name}: only JPG, PNG, and PDF files are allowed`,
                });
                return;
            }

            if (file.size > maxBytes) {
                addToast({
                    type: 'error',
                    title: `${file.name}: file must be under ${MAX_ATTACHMENT_SIZE_MB}MB`,
                });
                return;
            }

            validFiles.push(file);
        });

        if (validFiles.length === 0) {
            event.target.value = '';
            return;
        }

        setAttachmentFiles((current) => {
            const merged = [...current, ...validFiles];
            if (merged.length > MAX_ATTACHMENT_FILES) {
                addToast({
                    type: 'error',
                    title: `You can attach up to ${MAX_ATTACHMENT_FILES} files`,
                });
                return merged.slice(0, MAX_ATTACHMENT_FILES);
            }
            return merged;
        });

        event.target.value = '';
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachmentFiles((current) => current.filter((_, i) => i !== index));
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showMentionList || filteredUsers.length === 0) {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSubmit();
            }
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setHighlightedIndex((current) =>
                current + 1 >= filteredUsers.length ? 0 : current + 1,
            );
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlightedIndex((current) =>
                current - 1 < 0 ? filteredUsers.length - 1 : current - 1,
            );
            return;
        }

        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault();
            handleSelectUser(filteredUsers[highlightedIndex]);
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            setShowMentionList(false);
        }
    };

    useEffect(() => {
        if (!showMentionList || filteredUsers.length === 0) return;

        const highlightedItem = mentionListRef.current?.children[highlightedIndex];
        if (highlightedItem instanceof HTMLElement) {
            highlightedItem.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIndex, showMentionList, filteredUsers.length]);

    useEffect(() => {
        if (!showMentionList) return;

        const handleOutsideClick = (event: MouseEvent) => {
            if (composerRef.current && !composerRef.current.contains(event.target as Node)) {
                setShowMentionList(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [showMentionList]);

    const syncCursorFromTarget = (target: HTMLInputElement) => {
        const nextCursor = target.selectionStart ?? 0;
        setCursorPosition(nextCursor);
        syncMentionState(value, nextCursor);
    };

    return (
        <div className="flex items-start gap-3">
            <div ref={composerRef} className="relative min-w-0 flex-1">
                <Input
                    ref={inputRef}
                    size="sm"
                    value={value}
                    disabled={disabled}
                    placeholder={placeholder}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onClick={(event) => syncCursorFromTarget(event.currentTarget)}
                    onSelect={(event) => syncCursorFromTarget(event.currentTarget)}
                    rightIcon={
                        <Button
                            type="button"
                            color="transparent"
                            size="sm"
                            centerIcon={<Paperclip className="h-4 w-4" />}
                            disabled={disabled}
                            onClick={handleAttachmentClick}
                            className="h-auto w-auto p-0 text-gray-400 hover:text-gray-600"
                            aria-label="Attach file"
                        />
                    }
                />

                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept={ALLOWED_ATTACHMENT_TYPES.join(',')}
                    onChange={handleFileChange}
                    disabled={disabled}
                />

                {attachmentFiles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {attachmentFiles.map((file, index) => (
                            <span
                                key={`${file.name}-${index}`}
                                className="inline-flex max-w-full items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600"
                            >
                                <Paperclip className="h-3 w-3 shrink-0 text-gray-500" />
                                <span className="truncate">{file.name}</span>
                                <Button
                                    color="transparent"
                                    size="xss"
                                    centerIcon={<X className="h-3.5 w-3.5" />}
                                    onClick={() => handleRemoveAttachment(index)}
                                    disabled={disabled}
                                    className="p-0 text-gray-500"
                                    aria-label={`Remove ${file.name}`}
                                />
                            </span>
                        ))}
                    </div>
                )}

                {showMentionList && filteredUsers.length > 0 && (
                    <div
                        ref={mentionListRef}
                        className="absolute left-0 top-full z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                    >
                        {filteredUsers.map((user, index) => (
                            <Button
                                key={user.id}
                                color="transparent"
                                size="sm"
                                fullWidth
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    handleSelectUser(user);
                                }}
                                leftIcon={
                                    <div
                                        className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-gray-800 font-medium text-[10px] border border-gray-300"
                                        title={user.name?.trim() || '-'}
                                    >
                                        {getNameInitials(user.name?.trim() || '-')}
                                    </div>
                                }
                                className={`!justify-start !h-auto px-3 py-2 ${
                                    index === highlightedIndex
                                        ? 'bg-blue-50 text-blue-500'
                                        : 'text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                {user.name}
                            </Button>
                        ))}
                    </div>
                )}

                {showMentionList && filteredUsers.length === 0 && mentionQuery.trim() && (
                    <div className="absolute left-0 top-full z-20 mt-1 w-full max-w-full overflow-hidden rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
                        <p className="break-all [overflow-wrap:anywhere]">
                            No people found for &quot;@{mentionQuery}&quot;
                        </p>
                    </div>
                )}
            </div>

            <Button
                color="blue"
                size="sm"
                className="shrink-0"
                disabled={disabled || !canSubmit}
                onClick={handleSubmit}
            >
                Comment
            </Button>
        </div>
    );
};
