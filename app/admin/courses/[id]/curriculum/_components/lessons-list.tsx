"use client";

import { useEffect, useState } from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/confirm-modal";

interface LessonsListProps {
    items: {
        id: string;
        title: string;
        orderIndex: number;
        downloadUrl: string | null;
    }[];
    onReorder: (updateData: { id: string; orderIndex: number }[]) => void;
    onDelete: (id: string) => void;
}

export const LessonsList = ({
    items,
    onReorder,
    onDelete,
}: LessonsListProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const [lessons, setLessons] = useState(items);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setLessons(items);
    }, [items]);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(lessons);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const startIndex = Math.min(result.source.index, result.destination.index);
        const endIndex = Math.max(result.source.index, result.destination.index);

        const updatedLessons = items.slice(startIndex, endIndex + 1);

        setLessons(items);

        const bulkUpdateData = updatedLessons.map((lesson) => ({
            id: lesson.id,
            orderIndex: items.findIndex((item) => item.id === lesson.id),
        }));

        onReorder(bulkUpdateData);
    };

    if (!isMounted) {
        return null;
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="lessons">
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="divide-y"
                    >
                        {lessons.map((lesson, index) => (
                            <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                                {(provided) => (
                                    <div
                                        className={cn(
                                            "flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group",
                                            "bg-white"
                                        )}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div {...provided.dragHandleProps}>
                                                <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-400 cursor-move" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    Lecture {index + 1}:
                                                </span>
                                                <span>{lesson.title}</span>
                                                {lesson.downloadUrl && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                        Downloadable
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/admin/lessons/${lesson.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8">
                                                    <Edit className="h-3 w-3 mr-1" /> Edit Content
                                                </Button>
                                            </Link>
                                            <ConfirmModal onConfirm={() => onDelete(lesson.id)}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </ConfirmModal>
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};
