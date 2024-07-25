// declarations.d.ts
declare module 'react-beautiful-dnd' {
    import * as React from 'react';

    export interface DraggableLocation {
        droppableId: string;
        index: number;
    }

    export interface DraggableProps {
        draggableId: string;
        index: number;
    }

    export interface DroppableProps {
        droppableId: string;
    }

    export interface DropResult {
        draggableId: string;
        type: string;
        source: DraggableLocation;
        destination: DraggableLocation | null;
    }

    export interface DraggableProvided {
        innerRef: (element?: HTMLElement | null) => any;
        draggableProps: any;
        dragHandleProps: any;
    }

    export interface DraggableStateSnapshot {
        isDragging: boolean;
        draggingOver: string;
    }

    export interface DroppableProvided {
        innerRef: (element?: HTMLElement | null) => any;
        droppableProps: any;
        placeholder: React.ReactElement<any> | null;
    }

    export interface DroppableStateSnapshot {
        isDraggingOver: boolean;
        draggingOverWith: string;
    }

    export class DragDropContext extends React.Component<{ onDragEnd(result: DropResult): void }> {}
    export class Draggable extends React.Component<DraggableProps> {}
    export class Droppable extends React.Component<DroppableProps> {}
}
