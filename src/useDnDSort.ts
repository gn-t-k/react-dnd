import React, { useRef, useState } from 'react';

const isHover = (event: MouseEvent, element: HTMLElement): boolean => {
  const { clientX, clientY } = event;
  const { bottom, top, right, left } = element.getBoundingClientRect();

  return clientY < bottom && clientY > top && clientX < right && clientX > left;
};

interface IPosition {
  x: number;
  y: number;
}

interface IDnDItem<T> {
  value: T;
  key: string;
  position: IPosition;
  element: HTMLElement;
}

interface IDnDRef<T> {
  keys: Map<T, string>;
  dndItems: IDnDItem<T>[];
  canCheckHovered: boolean;
  pointerPosition: IPosition;
  dragElement: IDnDItem<T> | null;
}

interface IDnDSortResult<T> {
  key: string;
  value: T;
  events: {
    ref: (element: HTMLElement | null) => void;
    onMouseDown: (event: React.MouseEvent<HTMLElement>) => void;
  };
}

export const useDnDSort = <T>(defaultItems: T[]): IDnDSortResult<T>[] => {
  const [items, setItems] = useState(defaultItems);
  const state = useRef<IDnDRef<T>>({
    dndItems: [],
    keys: new Map<T, string>(),
    dragElement: null,
    canCheckHovered: true,
    pointerPosition: { x: 0, y: 0 },
  }).current;
  const onMouseMove = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const { dndItems, dragElement, pointerPosition } = state;

    if (!dragElement) return;

    const x = clientX - pointerPosition.x;
    const y = clientY - pointerPosition.y;
    const dragStyle = dragElement.element.style;

    dragStyle.zIndex = '100';
    dragStyle.cursor = 'grabbing';
    dragStyle.transform = `translate(${x}px,${y}px)`;

    if (!state.canCheckHovered) return;

    state.canCheckHovered = false;

    setTimeout(() => {
      state.canCheckHovered = true;
    }, 300);

    const dragIndex = dndItems.findIndex(({ key }) => key === dragElement.key);

    const hoveredIndex = dndItems.findIndex(
      ({ element }, index) => index !== dragIndex && isHover(event, element),
    );

    if (hoveredIndex !== -1) {
      state.pointerPosition.x = clientX;
      state.pointerPosition.y = clientY;

      dndItems.splice(dragIndex, 1);
      dndItems.splice(hoveredIndex, 0, dragElement);

      // eslint-disable-next-line no-shadow
      const { left: x, top: y } = dragElement.element.getBoundingClientRect();

      dragElement.position = { x, y };

      setItems(dndItems.map((v) => v.value));
    }
  };
  const onMouseUp = (_event: MouseEvent) => {
    const { dragElement } = state;

    if (!dragElement) return;

    const dragStyle = dragElement.element.style;

    dragStyle.zIndex = '';
    dragStyle.cursor = '';
    dragStyle.transform = '';

    state.dragElement = null;

    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('mousemove', onMouseMove);
  };

  return items.map(
    (value: T): IDnDSortResult<T> => {
      const key = state.keys.get(value) || Math.random().toString(16);
      state.keys.set(value, key);

      return {
        value,
        key,
        events: {
          ref: (element: HTMLElement | null) => {
            if (!element) return;

            const { dndItems, dragElement, pointerPosition } = state;

            // eslint-disable-next-line no-param-reassign
            element.style.transform = '';

            const { left: x, top: y } = element.getBoundingClientRect();
            const position: IPosition = { x, y };
            const itemIndex = dndItems.findIndex((item) => item.key === key);

            if (itemIndex === -1)
              dndItems.push({ key, value, element, position });

            if (dragElement?.key === key) {
              const dragX = dragElement.position.x - position.x;
              const dragY = dragElement.position.y - position.y;

              // eslint-disable-next-line no-param-reassign
              element.style.transform = `translate(${dragX}px,${dragY}px)`;

              pointerPosition.x -= dragX;
              pointerPosition.y -= dragY;
            }

            if (dragElement?.key === key) {
              const item = dndItems[itemIndex];

              // eslint-disable-next-line no-shadow
              const x = item.position.x - position.x;
              // eslint-disable-next-line no-shadow
              const y = item.position.y - position.y;
              // eslint-disable-next-line no-param-reassign
              element.style.transition = '';
              // eslint-disable-next-line no-param-reassign
              element.style.transform = `translate(${x}px,${y}px)`;

              requestAnimationFrame(() => {
                // eslint-disable-next-line no-param-reassign
                element.style.transform = '';
                // eslint-disable-next-line no-param-reassign
                element.style.transition = 'all 300ms';
              });
            }

            state.dndItems[itemIndex] = { key, value, element, position };
          },
          onMouseDown: (event: React.MouseEvent<HTMLElement>) => {
            const element = event.currentTarget;

            state.pointerPosition.x = event.clientX;
            state.pointerPosition.y = event.clientY;

            element.style.transition = '';
            element.style.cursor = 'grabbing';

            const { left: x, top: y } = element.getBoundingClientRect();
            const position: IPosition = { x, y };

            state.dragElement = { key, value, element, position };

            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('mousemove', onMouseMove);
          },
        },
      };
    },
  );
};
