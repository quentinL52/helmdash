'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { WidgetWrapper } from './widget-wrapper';
import { WIDGET_REGISTRY, WidgetSize, getDefaultLayout, GAMIFICATION_WIDGET_IDS } from './widget-registry';
import { useFounderStore } from '@/store/founder-store';
import { Button } from '@/components/ui/button';
import { Plus, Save, X, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface WidgetInstance {
  id: string; // unique id for the instance (can just be widget_type if no duplicates allowed)
  type: string; // key in WIDGET_REGISTRY
  size: WidgetSize;
}

export function WidgetGrid() {
  const store = useFounderStore();
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Local state for widgets
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // Load from store or use default
    if (store.dashboardLayout && store.dashboardLayout.length > 0) {
      setWidgets(store.dashboardLayout);
    } else {
      const defaultLayout = getDefaultLayout().map(item => ({
        id: item.id,
        type: item.id,
        size: item.size
      }));
      setWidgets(defaultLayout);
    }
  }, [store.dashboardLayout]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveLayout = () => {
    store.setDashboardLayout(widgets);
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    if (store.dashboardLayout && store.dashboardLayout.length > 0) {
      setWidgets(store.dashboardLayout);
    } else {
      setWidgets(getDefaultLayout().map(item => ({ id: item.id, type: item.id, size: item.size })));
    }
    setIsEditMode(false);
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const handleChangeSize = (id: string, newSize: WidgetSize) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, size: newSize } : w));
  };

  const handleAddWidget = (type: string) => {
    if (widgets.some(w => w.type === type)) {
      alert("Ce widget est déjà sur votre dashboard.");
      return;
    }
    
    const def = WIDGET_REGISTRY[type];
    if (!def) return;

    setWidgets([...widgets, { id: type, type, size: def.defaultSize }]);
  };

  const activeWidget = activeId ? widgets.find(w => w.id === activeId) : null;

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between bg-card border border-border p-3 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          <h2 className="font-pixel text-sm uppercase tracking-wider hidden sm:block">
            Dashboard
          </h2>
        </div>
        
        {isEditMode ? (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="font-pixel text-[10px]">
                  <Plus className="w-4 h-4 mr-1" /> WIDGET
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-pixel text-[10px]">WIDGETS DISPONIBLES</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.values(WIDGET_REGISTRY)
                  .filter(def => !(GAMIFICATION_WIDGET_IDS as readonly string[]).includes(def.id))
                  .map(def => (
                  <DropdownMenuItem 
                    key={def.id}
                    disabled={widgets.some(w => w.type === def.id)}
                    onClick={() => handleAddWidget(def.id)}
                    className="cursor-pointer"
                  >
                    {def.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-muted-foreground">
              <X className="w-4 h-4 mr-1" />
            </Button>
            <Button size="sm" onClick={handleSaveLayout} className="font-pixel text-[10px] bg-primary text-primary-foreground">
              <Save className="w-4 h-4 mr-1" /> SAUVEGARDER
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)} className="font-pixel text-[10px]">
            PERSONNALISER
          </Button>
        )}
      </div>

      {/* Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
          <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
            {widgets.map((widget) => {
              const def = WIDGET_REGISTRY[widget.type];
              if (!def) return null;
              
              const Component = def.component;
              
              return (
                <WidgetWrapper
                  key={widget.id}
                  id={widget.id}
                  title={def.name}
                  size={widget.size}
                  isEditMode={isEditMode}
                  onRemove={handleRemoveWidget}
                  onChangeSize={handleChangeSize}
                >
                  <Component isEditMode={isEditMode} />
                </WidgetWrapper>
              );
            })}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeWidget && WIDGET_REGISTRY[activeWidget.type] ? (
            <div className="opacity-80 scale-105 pointer-events-none w-full h-full">
               <WidgetWrapper
                  id={activeWidget.id}
                  title={WIDGET_REGISTRY[activeWidget.type].name}
                  size={activeWidget.size}
                  isEditMode={true}
                >
                  <div className="bg-card w-full h-full border-2 border-primary border-dashed rounded-xl flex items-center justify-center p-8">
                    <span className="font-pixel text-primary">{WIDGET_REGISTRY[activeWidget.type].name}</span>
                  </div>
                </WidgetWrapper>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
