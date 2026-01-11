// frontend/my-react-app/src/components/LayoutBuilder.jsx
import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    X,
    PencilSimple,
    DotsSixVertical,
    EyeSlash,
    Trash,
    Plus
} from "phosphor-react";

// --- Draggable Field Component (Visual Clone) ---
function SortableField({ id, field, onEdit, isOverlay }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    // Mimic the actual form field appearance
    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                relative group p-4 border-2 rounded-xl transition-all
                ${field.hidden ? 'border-dashed border-gray-300 bg-gray-50 opacity-60' : 'border-transparent hover:border-blue-200 bg-white hover:shadow-md'}
                ${isOverlay ? 'shadow-xl border-blue-500 scale-105 z-50 cursor-grabbing' : ''}
            `}
        >
            {/* Field Label & Required Mark */}
            <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>

                {/* Visual Indicators */}
                <div className="flex gap-1">
                    {field.hidden && <EyeSlash size={14} className="text-gray-400" />}
                </div>
            </div>

            {/* Mock Input Input */}
            <div className="h-10 w-full bg-gray-50 border border-gray-200 rounded px-3 flex items-center text-sm text-gray-400 pointer-events-none">
                {field.placeholder || "Input value..."}
            </div>

            {/* --- HOVER CONTROLS --- */}
            <div className={`
                absolute top-2 right-2 flex items-center gap-1
                opacity-0 group-hover:opacity-100 transition-opacity
                ${isOverlay ? 'opacity-0' : ''} 
            `}>
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(field); }}
                    className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    title="Edit Properties"
                >
                    <PencilSimple size={16} weight="bold" />
                </button>
                <div
                    {...attributes}
                    {...listeners}
                    className="p-1.5 bg-gray-100 text-gray-600 rounded cursor-grab hover:bg-gray-200 active:cursor-grabbing"
                    title="Drag to Move"
                >
                    <DotsSixVertical size={16} weight="bold" />
                </div>
            </div>
        </div>
    );
}

// --- Property Editor Side Panel ---
const PropertyEditor = ({ field, onChange, onClose }) => {
    if (!field) return null;

    return (
        <div className="w-80 border-l bg-white h-full p-6 shadow-xl flex flex-col animate-slideInRight">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold font-montserrat text-gray-800">Edit Field</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto">
                {/* Label */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Label</label>
                    <input
                        type="text"
                        value={field.label}
                        onChange={e => onChange({ ...field, label: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                {/* Key (Read Only) */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">System Key</label>
                    <input
                        type="text"
                        value={field.name}
                        disabled
                        className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-500 font-mono"
                    />
                </div>

                {/* Placeholder */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Placeholder</label>
                    <input
                        type="text"
                        value={field.placeholder || ""}
                        onChange={e => onChange({ ...field, placeholder: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-4 border-t">
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm font-medium text-gray-700">Required Field</span>
                        <div
                            onClick={() => onChange({ ...field, required: !field.required })}
                            className={`w-10 h-5 rounded-full relative transition-colors ${field.required ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${field.required ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm font-medium text-gray-700">Visible in Form</span>
                        <div
                            onClick={() => onChange({ ...field, hidden: !field.hidden })}
                            className={`w-10 h-5 rounded-full relative transition-colors ${!field.hidden ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${!field.hidden ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </label>
                </div>

                {/* Options Editor (for select/multiselect) */}
                {(field.type === 'select' || field.type === 'multiselect') && (
                    <div className="pt-4 border-t mt-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Field Options</label>
                        <div className="space-y-2 mb-3">
                            {(field.options || []).map((opt, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                            const newOpts = [...(field.options || [])];
                                            newOpts[idx] = e.target.value;
                                            onChange({ ...field, options: newOpts });
                                        }}
                                        className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                                    />
                                    <button
                                        onClick={() => {
                                            const newOpts = [...(field.options || [])];
                                            newOpts.splice(idx, 1);
                                            onChange({ ...field, options: newOpts });
                                        }}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="Remove Option"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                const newOpts = [...(field.options || []), "New Option"];
                                onChange({ ...field, options: newOpts });
                            }}
                            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors py-1 pl-1"
                        >
                            <Plus size={14} weight="bold" />
                            ADD NEW OPTION
                        </button>
                    </div>
                )}

            </div>

            <div className="pt-4 border-t mt-auto">
                <button
                    onClick={onClose}
                    className="w-full py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

// --- Main Builder Component ---
const LayoutBuilder = ({ fields, onSave, onClose }) => {
    const [items, setItems] = useState(fields);
    const [activeId, setActiveId] = useState(null); // For drag overlay
    const [editingField, setEditingField] = useState(null); // For side panel
    const [saving, setSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setItems((prev) => {
                const oldIndex = prev.findIndex((i) => i.name === active.id);
                const newIndex = prev.findIndex((i) => i.name === over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    };

    const handleFieldChange = (updatedField) => {
        setItems(prev => prev.map(f => f.name === updatedField.name ? updatedField : f));
        setEditingField(updatedField); // Keep editor in sync
    };

    const handleSaveLayout = async () => {
        setSaving(true);
        await onSave(items);
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-gray-100 flex flex-col">
            {/* --- Header --- */}
            <div className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 font-marcellus">Visual Form Editor</h2>
                    <p className="text-xs text-brandMuted">Drag to reorder. Click checkmark to valid/hide.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-full border border-gray-300 font-bold text-gray-500 hover:bg-gray-50 text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveLayout}
                        disabled={saving}
                        className="px-6 py-2 rounded-full bg-brandOrange text-white font-bold text-sm hover:bg-orange-600 shadow-md transition-all active:scale-95"
                    >
                        {saving ? "Saving..." : "Save Layout"}
                    </button>
                </div>
            </div>

            {/* --- Main Workspace --- */}
            <div className="flex-1 flex overflow-hidden">
                {/* Visual Canvas (Center) */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                    <div className="max-w-5xl mx-auto bg-white min-h-[800px] shadow-2xl rounded-xl p-10 border border-gray-100">
                        {/* Static Header Clone */}
                        <div className="flex justify-between items-center mb-8 border-b pb-4 opacity-50 pointer-events-none">
                            <h2 className="text-2xl font-marcellus font-medium text-gray-400">
                                New Entry (Preview)
                            </h2>
                        </div>

                        {/* Draggable Grid */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={items.map(i => i.name)}
                                strategy={rectSortingStrategy}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {items.map((field) => (
                                        <div
                                            key={field.name}
                                            className={
                                                (field.name === "project_id" ||
                                                    field.type === "textarea" ||
                                                    field.name.includes("description") ||
                                                    field.name.includes("impact") ||
                                                    field.name.includes("comments")
                                                ) ? "md:col-span-2" : ""
                                            }
                                        >
                                            <SortableField
                                                id={field.name}
                                                field={field}
                                                onEdit={setEditingField}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </SortableContext>

                            <DragOverlay>
                                {activeId ? (
                                    <SortableField
                                        id={activeId}
                                        field={items.find(i => i.name === activeId)}
                                        isOverlay
                                    />
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </div>
                    <div className="h-20" /> {/* Spacer */}
                </div>

                {/* Property Panel (Right) */}
                {editingField && (
                    <PropertyEditor
                        field={editingField}
                        onChange={handleFieldChange}
                        onClose={() => setEditingField(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default LayoutBuilder;
