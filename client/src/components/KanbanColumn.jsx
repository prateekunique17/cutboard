import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './KanbanItem';

export const KanbanColumn = ({ id, title, items }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col flex-shrink-0 w-80 bg-cb-black/40 border border-gray-800/80 rounded-2xl overflow-hidden shadow-lg h-[calc(100vh-140px)]">
      <div className="p-4 bg-cb-dark/80 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between sticky top-0 z-10">
        <h3 className="font-semibold text-gray-200 uppercase tracking-wider text-sm">{title}</h3>
        <span className="bg-cb-black px-2 py-0.5 rounded-full text-xs font-mono text-gray-400 border border-gray-800">
          {items.length}
        </span>
      </div>
      
      <div 
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto space-y-3 relative custom-scrollbar flex flex-col min-h-[150px]"
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} {...item} />
          ))}
        </SortableContext>
        
        {items.length === 0 && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-gray-600 text-sm font-medium">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  );
};
