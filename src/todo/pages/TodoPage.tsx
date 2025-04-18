import React, { useState } from 'react';
import { Divider, Splitter } from 'antd';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';
import { CategoriesFilter } from '../components/CategoriesFilter';

export function TodoPage(): React.ReactElement {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

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