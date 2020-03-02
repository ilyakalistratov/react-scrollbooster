import ScrollBooster, { ScrollBoosterOptions, ScrollingState } from 'scrollbooster';
import React, { useCallback, useRef, useState, MutableRefObject, ReactNode } from 'react';

interface ScrollBoostOptions<T> extends Omit<ScrollBoosterOptions, 'viewport' | 'onUpdate' | 'content'> {
    onUpdate?: (state: ScrollingState, node: T) => void;
}

interface ScrollBoostProps<T> {
    viewport: (node: T | null) => void;
    content: MutableRefObject<T | null>;
    instance: ScrollBooster | null;
}

/**
 * Returns ref values for the viewport, the content and the scrollbooster instance
 */
const useScrollBoost = <T extends HTMLElement>(options: ScrollBoostOptions<T> = {}) => {
    const content = useRef<T | null>(null);
    const [scrollBooster, setScrollBooster] = useState<ScrollBooster | null>(null);
    const viewport = useCallback(
        (node: T | null) => {
            if (scrollBooster) {
                // clear the scrollbooster eventListeners.
                scrollBooster.destroy();
            }
            if (node && !scrollBooster) {
                const { onUpdate, ...rest } = options;
                setScrollBooster(
                    new ScrollBooster({
                        viewport: node,
                        content: content.current ?? node,
                        onUpdate: state => onUpdate?.(state, node),
                        ...rest,
                    })
                );
            }
        },
        [scrollBooster, options]
    );

    return [viewport, content, scrollBooster] as const;
};

interface ScrollBoostConfig<T> extends Omit<ScrollBoostOptions<T>, 'viewport' | 'onUpdate' | 'content'> {
    children: (props: ScrollBoostProps<T>) => ReactNode;
}

function ScrollBoost<T extends HTMLElement>({ children, ...options }: ScrollBoostConfig<T>) {
    const [viewport, content, instance] = useScrollBoost<T>(options);
    return <>{children({ viewport, content, instance })}</>;
}

export { useScrollBoost, ScrollBoost, ScrollBoostOptions };