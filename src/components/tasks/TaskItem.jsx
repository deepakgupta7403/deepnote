import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  FiEdit2, FiTrash2, FiCheck, FiMoreHorizontal, FiClock, FiCalendar,
} from 'react-icons/fi'
import { RxDragHandleDots2 } from 'react-icons/rx'
import {
  PRIORITY_STYLES, getLabelColor, formatDate, isOverdue,
} from '../../utils/helpers.js'

/**
 * TaskItem — single row in the task list.
 * Wraps dnd-kit's useSortable so users can reorder by dragging the handle.
 */
export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  const overdue = !task.completed && isOverdue(task.due)
  const labelColor = getLabelColor(task.label)
  const prio = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group card p-4 flex items-start gap-3 hover:shadow-glow transition-all
                  ${isDragging ? 'shadow-glow z-10' : ''}`}
    >
      {/* Drag handle (visible on hover for desktop) */}
      <button
        {...attributes}
        {...listeners}
        className="mt-1 opacity-30 hover:opacity-80 cursor-grab active:cursor-grabbing transition"
        aria-label="Drag to reorder"
        title="Drag to reorder"
      >
        <RxDragHandleDots2 className="text-lg text-ink-400" />
      </button>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 transition-all grid place-items-center
        ${task.completed
          ? 'bg-ink-900 border-ink-900 dark:bg-white dark:border-white'
          : 'border-ink-300 dark:border-ink-600 hover:border-ink-500'}`}
        aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
      >
        {task.completed && <FiCheck className="text-white dark:text-ink-900 text-xs stroke-[3]" />}
      </button>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span className={`w-1.5 h-1.5 rounded-full mt-2 ${labelColor.dot}`} />
          <h4 className={`flex-1 text-[15px] leading-snug ${
            task.completed
              ? 'line-through text-ink-400 dark:text-ink-500'
              : 'text-ink-900 dark:text-ink-100'
          }`}>
            {task.title}
          </h4>
        </div>

        {task.notes && (
          <p className={`text-sm mt-1 leading-relaxed line-clamp-2 ${
            task.completed ? 'text-ink-400' : 'text-ink-500 dark:text-ink-400'
          }`}>
            {task.notes}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${prio.chip}`}>
            {task.priority}
          </span>

          {task.due && (
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1
              ${overdue
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'}`}
            >
              <FiCalendar className="text-[10px]" />
              {formatDate(task.due)}
              {overdue && ' · overdue'}
            </span>
          )}

          <span className="text-[11px] text-ink-400 inline-flex items-center gap-1">
            <FiClock className="text-[10px]" />
            {formatDate(task.createdAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
        <button
          onClick={() => onEdit(task)}
          className="btn-ghost p-2 rounded-lg"
          aria-label="Edit task"
          title="Edit"
        >
          <FiEdit2 className="text-sm" />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="btn-ghost p-2 rounded-lg hover:text-rose-600"
          aria-label="Delete task"
          title="Delete"
        >
          <FiTrash2 className="text-sm" />
        </button>
      </div>
    </div>
  )
}
