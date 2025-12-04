"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "@hello-pangea/dnd";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Feature {
    id: string;
    label: string;
    value: string;
}

interface FeaturesListProps {
    initialFeatures: { label: string; value: string }[];
}

export const FeaturesList = ({ initialFeatures }: FeaturesListProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const [features, setFeatures] = useState<Feature[]>(
        initialFeatures.map((f) => ({ ...f, id: crypto.randomUUID() }))
    );

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    if (!isMounted) {
        return null;
    }

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(features);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setFeatures(items);
    };

    const addFeature = () => {
        setFeatures([...features, { id: crypto.randomUUID(), label: "", value: "" }]);
    };

    const removeFeature = (id: string) => {
        setFeatures(features.filter((f) => f.id !== id));
    };

    const updateFeature = (id: string, field: "label" | "value", newValue: string) => {
        setFeatures(
            features.map((f) => (f.id === id ? { ...f, [field]: newValue } : f))
        );
    };

    if (!isMounted) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Everything Included Features</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                </Button>
            </div>

            {/* Hidden input to submit JSON data */}
            <input
                type="hidden"
                name="features"
                value={JSON.stringify(features.map(({ label, value }) => ({ label, value })))}
            />

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="features">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2"
                        >
                            {features.map((feature, index) => (
                                <Draggable key={feature.id} draggableId={feature.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border"
                                        >
                                            <div {...provided.dragHandleProps}>
                                                <GripVertical className="h-5 w-5 text-slate-400 cursor-move" />
                                            </div>
                                            <div className="flex-1 grid grid-cols-2 gap-2">
                                                <Input
                                                    placeholder="Label (e.g. Complete Course Access)"
                                                    value={feature.label}
                                                    onChange={(e) =>
                                                        updateFeature(feature.id, "label", e.target.value)
                                                    }
                                                    className="bg-white"
                                                />
                                                <Input
                                                    placeholder="Value (e.g. $197)"
                                                    value={feature.value}
                                                    onChange={(e) =>
                                                        updateFeature(feature.id, "value", e.target.value)
                                                    }
                                                    className="bg-white"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFeature(feature.id)}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            {features.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                    No features added yet. Click "Add Feature" to start.
                </p>
            )}
        </div>
    );
};
