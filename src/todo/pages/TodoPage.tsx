import React, { useState } from 'react';
import { Divider, Splitter, Alert } from 'antd';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';
import { CategoriesFilter } from '../components/CategoriesFilter';
import { useTodoDBInit } from '../hooks/useTodoDBInit';

export function TodoPage(): React.ReactElement {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { loading: dbInitLoading, error: dbInitError } = useTodoDBInit();

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Show loading state while initializing database
  if (dbInitLoading) {
    return <div style={{ margin: 24 }}>Setting up todo functionality...</div>;
  }

  // Show error state if initialization failed
  if (dbInitError) {
    return (
      <div style={{ margin: 24 }}>
        <Alert
          type="error"
          message="Failed to initialize todo functionality"
          description={dbInitError.message}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ margin: 24  }}>
        <TodoForm categoryId={selectedCategory === 'all' || selectedCategory === 'uncategorized' ? undefined : selectedCategory} />
      </div>
      <Divider style={{
          top: 0,
          bottom: 0,
          margin: 0
        }} 
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Splitter style={{ height: '100%' }}>
          <Splitter.Panel defaultSize="25%" min="20%" max="70%">
            <CategoriesFilter 
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          </Splitter.Panel>
          <Splitter.Panel>
            <TodoList categoryId={selectedCategory} />
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
} 