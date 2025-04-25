import { useState, useEffect, useCallback } from 'react';
import { App } from 'antd';
import { usePouchDB } from '../../shared/contexts/PouchDBProvider';
import { UseCategoriesReturn } from '../types';
import { CategoryDocument, TodoDocument } from '../../shared/types';

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { dbOperations } = usePouchDB();
  const { message } = App.useApp();

  // Helper function to fetch categories with silent option
  const fetchCategories = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      
      const result = await dbOperations.find<CategoryDocument>(
        { type: 'category' },
        [ { type: 'asc' }, { name: 'asc' } ],
        'idx-type-name'
      );
      
      setCategories(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to fetch categories', error);
      if (!silent) {
        setError(error);
        message.error('Failed to load categories');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [dbOperations, message]);

  // Fetch all categories
  useEffect(() => {
    fetchCategories(false); // Not silent on initial load
  }, [fetchCategories]);

  // Subscribe to changes in category documents
  useEffect(() => {
    const unsubscribe = dbOperations.subscribeToChanges((change) => {
      const changedDoc = change.doc;
      
      // Skip if no document
      if (!changedDoc) {
        return;
      }
      
      // Check for category prefix in _id or category type
      const isCategoryDoc = changedDoc._id.startsWith('category:') || changedDoc.type === 'category';
      if (!isCategoryDoc) {
        return;
      }
      
      // Just refetch all categories instead of updating state directly
      // Use silent=true to not affect the loading state
      fetchCategories(true);
    });
    
    // Clean up subscription on unmount
    return unsubscribe;
  }, [dbOperations, fetchCategories]);

  // Create a new category
  const createCategory = useCallback(async (name: string): Promise<void> => {
    try {
      // Validate category name
      if (!name.trim()) {
        throw new Error('Category name cannot be empty');
      }
      
      // Check for duplicate name
      const duplicateCategory = categories.find(
        c => c.name.toLowerCase() === name.trim().toLowerCase()
      );
      
      if (duplicateCategory) {
        throw new Error('A category with this name already exists');
      }
      
      const now = new Date().toISOString();
      const newCategory: Omit<CategoryDocument, '_id' | '_rev'> = {
        type: 'category',
        name: name.trim(),
        createdAt: now,
        updatedAt: now
      };
      
      await dbOperations.create<CategoryDocument>(newCategory);
      message.success('Category created successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to create category', error);
      setError(error);
      message.error(error.message || 'Failed to create category');
      throw error;
    }
  }, [categories, dbOperations, message]);

  // Update a category's name
  const updateCategory = useCallback(async (
    category: CategoryDocument, 
    newName: string
  ): Promise<void> => {
    try {
      // Validate category name
      if (!newName.trim()) {
        throw new Error('Category name cannot be empty');
      }
      
      // Check for duplicate name (excluding current category)
      const duplicateCategory = categories.find(
        c => c._id !== category._id && c.name.toLowerCase() === newName.trim().toLowerCase()
      );
      
      if (duplicateCategory) {
        throw new Error('A category with this name already exists');
      }
      
      const updatedCategory = {
        ...category,
        name: newName.trim(),
        updatedAt: new Date().toISOString()
      };
      
      await dbOperations.update<CategoryDocument>(updatedCategory);
      message.success('Category updated successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to update category', error);
      setError(error);
      message.error(error.message || 'Failed to update category');
      throw error;
    }
  }, [categories, dbOperations, message]);

  // Delete a category
  const deleteCategory = useCallback(async (category: CategoryDocument): Promise<void> => {
    try {
      // Check if any todos use this category
      const associatedTodos = await dbOperations.find<TodoDocument>(
        {
          type: 'todo',
          categoryIds: { $elemMatch: { $eq: category._id } }
        }
      );
      
      if (associatedTodos.length > 0) {
        // Remove the category from all associated todos
        const updatePromises = associatedTodos.map(todo => {
          const updatedTodo = {
            ...todo,
            categoryIds: todo.categoryIds.filter(id => id !== category._id),
            updatedAt: new Date().toISOString()
          };
          return dbOperations.update<TodoDocument>(updatedTodo);
        });
        
        await Promise.all(updatePromises);
      }

      // Now delete the category
      await dbOperations.remove(category);
      message.success(`Category deleted successfully${associatedTodos.length > 0 ? ` and removed from ${associatedTodos.length} todos` : ''}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to delete category', error);
      setError(error);
      message.error('Failed to delete category');
      throw error;
    }
  }, [dbOperations, message]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory
  };
} 