'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  CommandBarActionItem,
  ACTION_WIDTHS,
  OVERFLOW_BUTTON_WIDTH,
} from './commandBarTypes';

export function useCommandBarOverflow(actions: CommandBarActionItem[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setContainerWidth(width);
      }
    };

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect?.width || el.clientWidth;
          if (width > 0) {
            setContainerWidth(width);
          }
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const { visibleActions, overflowActions } = useMemo(() => {
    if (containerWidth === null) {
      // Prior to initial measurement, show all actions safely
      return { visibleActions: actions, overflowActions: [] };
    }

    const totalNeeded = actions.reduce((sum, a) => {
      const w = (ACTION_WIDTHS[a.id] || 80) + (a.dividerBefore ? 10 : 0);
      return sum + w;
    }, 0);

    // If everything fits within available container width, no overflow needed
    if (containerWidth >= totalNeeded) {
      return { visibleActions: actions, overflowActions: [] };
    }

    const budget = Math.max(0, containerWidth - OVERFLOW_BUTTON_WIDTH);
    let accumulated = 0;
    const visible: CommandBarActionItem[] = [];
    const overflow: CommandBarActionItem[] = [];

    for (const action of actions) {
      const itemCost = (ACTION_WIDTHS[action.id] || 80) + (action.dividerBefore ? 10 : 0);
      if (accumulated + itemCost <= budget && overflow.length === 0) {
        accumulated += itemCost;
        visible.push(action);
      } else {
        overflow.push(action);
      }
    }

    // Ensure at least 1 action is visible if width permits
    if (visible.length === 0 && actions.length > 0 && containerWidth >= 110) {
      visible.push(actions[0]);
      return { visibleActions: visible, overflowActions: actions.slice(1) };
    }

    return { visibleActions: visible, overflowActions: overflow };
  }, [actions, containerWidth]);

  return { containerRef, visibleActions, overflowActions, containerWidth };
}
