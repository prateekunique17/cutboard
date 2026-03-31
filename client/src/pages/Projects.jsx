import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from '../components/KanbanColumn';
import { KanbanItem } from '../components/KanbanItem';
import UploadModal from '../components/UploadModal';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';

const COLUMNS = ['todo', 'active', 'review', 'done'];

const EMPTY = COLUMNS.reduce((acc, c) => ({ ...acc, [c]: [] }), {});

export default function Projects() {
  const [items, setItems]       = useState(EMPTY);
  const [activeId, setActiveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchVideos = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/api/videos`);
      if (response.ok) {
        const data = await response.json();
        const map = (arr) =>
          (arr || []).map((c) => ({
            id:        c.id,
            title:     c.title,
            duration:  c.duration || '0:00',
            comments:  0,
            version:   c.version || 1,
            status:    c.status,
            thumbnail: c.thumbnail,
            cardId:    c.cardId,
          }));
        setItems({ 
          todo: map(data.todo || []),
          active: map(data.active || []),
          review: map(data.review || []),
          done: map(data.done || []) 
        });
      }
    } catch (err) {
      console.error('Fetch failed', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  /* ── DnD helpers ──────────────────────── */
  const findContainer = (id) => {
    if (id in items) return id;
    for (const key of Object.keys(items)) {
      if (items[key].find((item) => item.id === id)) return key;
    }
  };

  const handleDragStart = (e) => setActiveId(e.active.id);

  const handleDragOver = ({ active, over }) => {
    const overId = over?.id;
    if (!overId || active.id === overId) return;
    const ac = findContainer(active.id);
    const oc = findContainer(overId);
    if (!ac || !oc || ac === oc) return;

    setItems((prev) => {
      const aItems = prev[ac];
      const oItems = prev[oc];
      const aIdx   = aItems.findIndex((i) => i.id === active.id);
      const oIdx   = oItems.findIndex((i) => i.id === overId);
      const newIdx = oIdx >= 0 ? oIdx : oItems.length + 1;
      return {
        ...prev,
        [ac]: aItems.filter((i) => i.id !== active.id),
        [oc]: [
          ...oItems.slice(0, newIdx),
          aItems[aIdx],
          ...oItems.slice(newIdx),
        ],
      };
    });
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const ac = findContainer(active.id);
    const oc = findContainer(over.id);
    if (!ac || !oc) return;

    if (ac === oc) {
      const aIdx = items[ac].findIndex((i) => i.id === active.id);
      const oIdx = items[oc].findIndex((i) => i.id === over.id);
      if (aIdx !== oIdx) {
        setItems((prev) => ({
          ...prev,
          [oc]: arrayMove(prev[oc], aIdx, oIdx),
        }));
      }
    } else {
      try {
        const activeItem = items[ac].find((i) => i.id === active.id);
        const res = await fetch(`${API_URL}/api/videos/status`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ cardId: activeItem.cardId, status: oc }),
        });
        if (!res.ok) throw new Error('Sync failed');
      } catch (err) {
        console.error('Status update failed', err);
        fetchVideos(true);
      }
    }
  };

  const getActiveItem = () => {
    for (const key of Object.keys(items)) {
      const found = items[key].find((i) => i.id === activeId);
      if (found) return { ...found, columnId: key };
    }
    return null;
  };

  const totalCards = Object.values(items).reduce((s, a) => s + a.length, 0);

  /* ── Render ───────────────────────────── */
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" strokeWidth={1.5} />
          <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">Loading board…</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full gap-0"
    >
      {/* ── Board header ───────────────── */}
      <header className="flex items-center justify-between mb-8 flex-shrink-0 backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl">
        <div className="flex items-end gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white leading-none mb-2">
              Project Board
            </h1>
            <p className="text-sm text-gray-400 font-medium">
              {totalCards} card{totalCards !== 1 ? 's' : ''} across {COLUMNS.length} columns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchVideos(true)}
            disabled={refreshing}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all shadow-sm flex items-center justify-center"
            title="Refresh"
          >
            <RefreshCw
              size={18}
              strokeWidth={2}
              className={refreshing ? 'animate-spin opacity-50' : ''}
            />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-all shadow-lg active:scale-95 hover:scale-105"
          >
            <Plus size={18} strokeWidth={3} />
            New Sticker
          </button>
        </div>
      </header>

      {/* ── Kanban board ───────────────── */}
      <div className="flex-1 overflow-x-auto custom-scrollbar pb-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex justify-center gap-4 h-full w-full px-2">
            {COLUMNS.map((colId) => (
              <KanbanColumn
                key={colId}
                id={colId}
                title={colId}
                items={items[colId] || []}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
            {activeId ? (
              <div className="rotate-3 shadow-2xl scale-105 transition-all">
                <KanbanItem
                  id={activeId}
                  {...getActiveItem()}
                  isDragging={true}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={() => fetchVideos(true)}
      />
    </motion.div>
  );
}
