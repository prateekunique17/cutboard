import { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import { 
  arrayMove, 
  sortableKeyboardCoordinates 
} from '@dnd-kit/sortable';
import { KanbanColumn } from '../components/KanbanColumn';
import { KanbanItem } from '../components/KanbanItem';
import UploadModal from '../components/UploadModal';
import { Loader2 } from 'lucide-react';

export default function Projects() {
  const [items, setItems] = useState({ active: [], done: [] });
  const [activeId, setActiveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchVideos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/videos');
      if (response.ok) {
        const data = await response.json();
        const formatted = {
          active: (data.active || []).map(c => ({ 
            id: c.id, 
            title: c.title, 
            duration: c.duration || '0:00', 
            comments: 0, 
            version: c.version || 1,
            status: c.status,
            thumbnail: c.thumbnail,
            cardId: c.cardId
          })),
          done: (data.done || []).map(c => ({ 
            id: c.id, 
            title: c.title, 
            duration: c.duration || '0:00', 
            comments: 0, 
            version: c.version || 1,
            status: c.status,
            thumbnail: c.thumbnail,
            cardId: c.cardId
          }))
        };
        setItems(formatted);
      }
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const findContainer = (id) => {
    if (id in items) return id;
    for (const key of Object.keys(items)) {
      if (items[key].find(item => item.id === id)) {
        return key;
      }
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    const overId = over?.id;
    if (!overId || active.id === overId) return;
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex(i => i.id === active.id);
      const overIndex = overItems.findIndex(i => i.id === overId);
      let newIndex = overIndex >= 0 ? overIndex : overItems.length + 1;

      return {
        ...prev,
        [activeContainer]: [...activeItems.filter(item => item.id !== active.id)],
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...overItems.slice(newIndex)
        ]
      };
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    
    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      const activeIndex = items[activeContainer].findIndex(i => i.id === active.id);
      const overIndex = items[overContainer].findIndex(i => i.id === over.id);
      if (activeIndex !== overIndex) {
        setItems((prev) => ({
          ...prev,
          [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex),
        }));
      }
    } else {
       try {
         const activeItem = items[activeContainer].find(i => i.id === active.id);
         const res = await fetch('http://localhost:5000/api/videos/status', {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ cardId: activeItem.cardId, status: overContainer })
         });
         if (!res.ok) throw new Error("Sync failed");
       } catch (err) {
         console.error("Failed to update status", err);
         fetchVideos(); // Refresh to original state on failure
       }
    }
  };

  const getActiveItem = () => {
    for (const key of Object.keys(items)) {
      const found = items[key].find(item => item.id === activeId);
      if (found) return found;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-cb-orange" />
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-6 pb-2">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Project Kanban Workspace</h1>
          <p className="text-gray-400 text-sm">Drag and drop sequences into specific review states.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-sm px-5 pr-6"
        >
          + New Card
        </button>
      </header>

      <div className="flex-1 overflow-x-auto custom-scrollbar flex gap-6 pb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <KanbanColumn id="active" title="Active Projects" items={items['active']} />
          <KanbanColumn id="done" title="Finished" items={items['done']} />
          
          <DragOverlay>
            {activeId ? <KanbanItem id={activeId} {...getActiveItem()} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUploadSuccess={() => fetchVideos()} 
      />
    </div>
  );
}
