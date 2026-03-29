import { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, MessageSquare, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export const KanbanItem = forwardRef(({ id, title, duration, comments, version, thumbnail, ...props }, ref) => {
  return (
    <Link to={`/app/videos/${id}`} className="block">
      <div 
        ref={ref} 
        {...props}
        className={`glass-card p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-cb-orange/50 transition-colors group flex flex-col gap-3 relative`}
      >
        <div className="w-full h-32 bg-gray-900 rounded-lg relative overflow-hidden group-hover:shadow-[0_0_15px_rgba(245,92,26,0.2)] transition-all">
          {/* Thumbnail or Placeholder */}
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={title} 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Play size={30} className="text-gray-600 group-hover:text-cb-orange opacity-50 transition-all" />
            </div>
          )}
          
          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-mono text-white flex items-center gap-1 backdrop-blur-sm">
            <Clock size={12} /> {duration}
          </div>
          <div className="absolute top-2 left-2 bg-gradient-to-r from-cb-orange to-cb-amber text-white text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            v{version}
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-medium text-sm truncate">{title}</h4>
        </div>

        <div className="flex items-center justify-between text-gray-500 text-xs mt-1">
          <div className="flex items-center gap-1 hover:text-white transition-colors">
            <MessageSquare size={14} /> {comments}
          </div>
          <div className="flex -space-x-2">
              <img className="w-6 h-6 rounded-full border border-cb-dark" src="https://ui-avatars.com/api/?name=Ed&background=random" />
          </div>
        </div>
      </div>
    </Link>
  );
});

export const SortableItem = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id, data: { ...props } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanItem {...props} />
    </div>
  );
};
