import { Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./task-card";
import { Task } from "@shared/schema";

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    color: string;
  };
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function KanbanColumn({ column, tasks, onAddTask, onEditTask, onDeleteTask }: KanbanColumnProps) {
  return (
    <div className="kanban-column flex-1 min-w-80">
      <div className="column-header glass-card rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: column.color }}
            />
            <h3 className="font-semibold">{column.title}</h3>
            <span 
              className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground"
              data-testid={`text-${column.id}-count`}
            >
              {tasks.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddTask}
            data-testid={`button-add-task-${column.id}`}
          >
            <i className="fas fa-plus"></i>
          </Button>
        </div>
      </div>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`task-container space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
              snapshot.isDraggingOver ? "bg-muted/20" : ""
            }`}
            data-testid={`column-${column.id}`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? "rotate-3 scale-105" : ""}
                  >
                    <TaskCard
                      task={task}
                      onEdit={() => onEditTask(task)}
                      onDelete={() => onDeleteTask(task.id)}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            
            {tasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <i className="fas fa-inbox text-2xl mb-2 block"></i>
                <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
