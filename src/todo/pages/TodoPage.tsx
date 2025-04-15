import React, { useState } from 'react';
import { Card, Splitter } from 'antd';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';
import { CategoriesFilter } from '../components/CategoriesFilter';

export function TodoPage(): React.ReactElement {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <div style={{ marginBottom: 20 }}>
        <TodoForm categoryId={selectedCategory === 'all' || selectedCategory === 'uncategorized' ? undefined : selectedCategory} />
      </div>
      
      <Card style={{ flex: 1, overflow: 'hidden' }}>
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
      </Card>
    </div>
  );
} 