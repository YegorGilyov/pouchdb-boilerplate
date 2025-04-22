import { useState, useEffect, useCallback } from 'react';
import { App } from 'antd';
import { usePouchDB } from '../../shared/contexts/PouchDBProvider';
import { TodoDocument } from '../../shared/types';
import { UseTodosReturn } from '../types';

export function useTodos(categoryId?: string): UseTodosReturn {
  const [todos, setTodos] = useState<TodoDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { dbOperations } = usePouchDB();
  const { message } = App.useApp();

  // Helper function to fetch todos with silent option
  const fetchTodos = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      
      let selector: PouchDB.Find.Selector = { type: 'todo' };
      
      // Apply category filtering
      if (categoryId) {
        if (categoryId === 'uncategorized') {
          // Fetch todos with empty categoryIds array
          selector = {
            type: 'todo',
            createdAt: { $gte: null },
            categoryIds: { $size: 0 }
          };
        } else if (categoryId !== 'all') {
          // Fetch todos from a specific category
          selector = {
            type: 'todo',
            createdAt: { $gte: null },
            categoryIds: { $elemMatch: { $eq: categoryId } }
          };
        }
      }
      
      const result = await dbOperations.find<TodoDocument>(
        selector,
        [ { type: 'desc' }, { createdAt: 'desc' } ],
        'idx-type-createdAt-categoryIds'
      );
      
      setTodos(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to fetch todos', error);
      if (!silent) {
        setError(error);
        message.error('Failed to load todos');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [categoryId, dbOperations, setTodos, setLoading, setError, message]);

  // Fetch todos based on category filter
  useEffect(() => {
    fetchTodos(false); // Not silent on initial load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  // Subscribe to changes in todo documents
  useEffect(() => {
    const unsubscribe = dbOperations.subscribeToChanges((change) => {
      const changedDoc = change.doc;
      
      // Skip if no document
      if (!changedDoc) {
        return;
      }
      
      // Check for todo prefix in _id or todo type
      const isTodoDoc = changedDoc._id.startsWith('todo:') || changedDoc.type === 'todo';
      if (!isTodoDoc) {
        return;
      }

      // Just refetch all todos instead of updating state directly
      // Use silent=true to not affect the loading state
      fetchTodos(true);
    });
    
    // Clean up subscription on unmount
    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  // Create a new todo
  const createTodo = async (title: string): Promise<void> => {
    try {
      const now = new Date().toISOString();
      const newTodo: Omit<TodoDocument, '_id' | '_rev'> = {
        type: 'todo',
        title: title.trim(),
        completed: false,
        createdAt: now,
        updatedAt: now,
        categoryIds: []
      };
      
      await dbOperations.create<TodoDocument>(newTodo);
      message.success('Todo created successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to create todo', error);
      setError(error);
      message.error('Failed to create todo');
      throw error;
    }
  };

  // Update a todo's title or completion status
  const updateTodo = async (
    todo: TodoDocument, 
    updates: { title?: string; completed?: boolean }
  ): Promise<void> => {
    try {
      const updatedTodo = { 
        ...todo,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await dbOperations.update<TodoDocument>(updatedTodo);
      message.success('Todo updated successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to update todo', error);
      setError(error);
      message.error('Failed to update todo');
      throw error;
    }
  };

  // Delete a todo
  const deleteTodo = async (todo: TodoDocument): Promise<void> => {
    try {
      await dbOperations.remove(todo);
      message.success('Todo deleted successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to delete todo', error);
      setError(error);
      message.error('Failed to delete todo');
      throw error;
    }
  };

  // Add a todo to a category
  const addTodoToCategory = async (
    todo: TodoDocument, 
    categoryId: string
  ): Promise<void> => {
    try {
      // Skip if the category is already assigned
      if (todo.categoryIds.includes(categoryId)) {
        return;
      }
      
      const updatedTodo = {
        ...todo,
        categoryIds: [...todo.categoryIds, categoryId],
        updatedAt: new Date().toISOString()
      };
      
      await dbOperations.update<TodoDocument>(updatedTodo);
      message.success('Todo added to category');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to add todo to category', error);
      setError(error);
      message.error('Failed to add todo to category');
      throw error;
    }
  };

  // Remove a todo from a category
  const removeTodoFromCategory = async (
    todo: TodoDocument, 
    categoryId: string
  ): Promise<void> => {
    try {
      const updatedTodo = {
        ...todo,
        categoryIds: todo.categoryIds.filter(id => id !== categoryId),
        updatedAt: new Date().toISOString()
      };
      
      await dbOperations.update<TodoDocument>(updatedTodo);
      message.success('Todo removed from category');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to remove todo from category', error);
      setError(error);
      message.error('Failed to remove todo from category');
      throw error;
    }
  };

  return {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    addTodoToCategory,
    removeTodoFromCategory
  };
} 