// components/Accordion.tsx
import React, { useState, useId } from 'react';

export interface AccordionItemData {
    key: string;
    title: string;
    defaultOpen?: boolean;
    content?: React.ReactNode;
}

type AccordionProps = {
    items?: AccordionItemData[];
    openMap?: Record<string, boolean>;
    onToggle?: (key: string, newOpen: boolean) => void;
    renderItem?: (item: AccordionItemData, isOpen: boolean, toggle: () => void) => React.ReactNode;
    className?: string;
    allowMultipleOpen?: boolean;
};

export const Accordion: React.FC<AccordionProps> = ({
    items = [],
    openMap,
    onToggle,
    renderItem,
    className = '',
    allowMultipleOpen = true,
}) => {

    const [localOpen, setLocalOpen] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        items.forEach(i => {
            if (i.defaultOpen) initial[i.key] = true;
        });
        return initial;
    });

    const isControlled = typeof openMap !== 'undefined';

    const toggle = (key: string) => {
        if (isControlled) {
            const newVal = !openMap![key];
            onToggle?.(key, newVal);
            return;
        }

        setLocalOpen(prev => {
            const currently = !!prev[key];
            if (allowMultipleOpen) {
                return { ...prev, [key]: !currently };
            } else {
                return Object.fromEntries(items.map(it => [it.key, it.key === key ? !currently : false]));
            }
        });
    };

    const isOpen = (key: string) => {
        return isControlled ? !!openMap![key] : !!localOpen[key];
    };

    // ✅ call useId ONCE — NOT inside map
    const baseId = useId();   // <-- ONLY CHANGE

    return (
        <div className={className}>
            {items.map(item => {
                const id = `${baseId}-${item.key}`;   // <-- SAFE NOW
                const open = isOpen(item.key);

                if (renderItem) {
                    return (
                        <div key={item.key} className="bg-white border border-gray-200 rounded shadow-sm mb-3">
                            {renderItem(item, open, () => toggle(item.key))}
                        </div>
                    );
                }

                return (
                    <div key={item.key} className="bg-white border border-gray-200 rounded shadow-sm mb-3">
                        <div className="flex items-center justify-between px-4 py-3" onClick={() => toggle(item.key)}>
                            <h5 className="font-medium">{item.title}</h5>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggle(item.key)}
                                    className="text-gray-400"
                                    aria-expanded={open}
                                    aria-controls={id}
                                >
                                    {open ? '▾' : '▸'}
                                </button>
                            </div>
                        </div>

                        <div
                            id={id}
                            role="region"
                            aria-hidden={!open}
                            className={`px-4 pb-4 pt-2 text-sm text-gray-700 transition-all ${open ? 'block' : 'hidden'}`}
                        >
                            {item.content ?? <p>Placeholder content for {item.title}</p>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Accordion;
