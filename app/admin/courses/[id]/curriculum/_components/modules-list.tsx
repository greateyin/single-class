"use client";

import { useEffect, useState } from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, Plus, Trash2, Edit2, Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { ConfirmModal } from "@/components/confirm-modal";
import { LessonsList } from "./lessons-list";

interface ModulesListProps {
    items: {
        id: string;
        title: string;
        orderIndex: number;
        lessons: {
            id: string;
            title: string;
            orderIndex: number;
            downloadUrl: string | null;
        }[];
    }[];
    onReorder: (updateData: { id: string; orderIndex: number }[]) => void;
    onUpdate: (id: string, title: string) => void;
    onDelete: (id: string) => void;
    onReorderLessons: (moduleId: string, updateData: { id: string; orderIndex: number }[]) => void;
    onDeleteLesson: (lessonId: string) => void;
    onCreateLesson: (moduleId: string, formData: FormData) => void;
}

export const ModulesList = ({
    items,
    onReorder,
    onUpdate,
    onDelete,
    onReorderLessons,
    onDeleteLesson,
    onCreateLesson,
}: ModulesListProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const [modules, setModules] = useState(items);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setModules(items);
    }, [items]);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(modules);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const startIndex = Math.min(result.source.index, result.destination.index);
        const endIndex = Math.max(result.source.index, result.destination.index);

        const updatedModules = items.slice(startIndex, endIndex + 1);

        setModules(items);

        const bulkUpdateData = updatedModules.map((module) => ({
            id: module.id,
            orderIndex: items.findIndex((item) => item.id === module.id),
        }));

        onReorder(bulkUpdateData);
    };

    const startEditing = (id: string, title: string) => {
        setEditingId(id);
        setEditTitle(title);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditTitle("");
    };

    const saveTitle = (id: string) => {
        onUpdate(id, editTitle);
        setEditingId(null);
    };

    if (!isMounted) {
        return null;
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="modules">
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-6"
                    >
                        {modules.map((module, index) => (
                            <Draggable key={module.id} draggableId={module.id} index={index}>
                                {(provided) => (
                                    <Card
                                        className="overflow-hidden"
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                    >
                                        <CardHeader className="bg-slate-100 py-3 flex flex-row items-center justify-between space-y-0">
                                            <div className="flex items-center gap-2 font-semibold flex-1">
                                                <div {...provided.dragHandleProps}>
                                                    <GripVertical className="h-4 w-4 text-slate-400 cursor-move" />
                                                </div>
                                                {editingId === module.id ? (
                                                    <div className="flex items-center gap-2 flex-1 max-w-md">
                                                        <Input
                                                            value={editTitle}
                                                            onChange={(e) => setEditTitle(e.target.value)}
                                                            className="h-8 bg-white"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    saveTitle(module.id);
                                                                } else if (e.key === "Escape") {
                                                                    cancelEditing();
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => saveTitle(module.id)}
                                                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={cancelEditing}
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 group">
                                                        <span>
                                                            Section {index + 1}: {module.title}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => startEditing(module.id, module.title)}
                                                        >
                                                            <Edit2 className="h-3 w-3 text-slate-500" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ConfirmModal onConfirm={() => onDelete(module.id)}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </ConfirmModal>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <LessonsList
                                                items={module.lessons}
                                                onReorder={(updateData) =>
                                                    onReorderLessons(module.id, updateData)
                                                }
                                                onDelete={onDeleteLesson}
                                            />

                                            {/* Add Lesson to Module */}
                                            <div className="p-4 bg-slate-50/50 border-t">
                                                <form
                                                    action={(formData) => onCreateLesson(module.id, formData)}
                                                    className="flex gap-3 pl-7"
                                                >
                                                    <Input
                                                        name="title"
                                                        placeholder="New Lecture Title"
                                                        required
                                                        className="flex-1 h-9 text-sm"
                                                    />
                                                    <Button type="submit" size="sm" variant="outline">
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Add Lecture
                                                    </Button>
                                                </form>
                                            </div>
                                        </CardContent>
                                    </Card>
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
