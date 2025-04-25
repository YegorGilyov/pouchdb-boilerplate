import React, { useMemo, useCallback } from 'react';
import { Table, Checkbox, Typography, Tag, Space, Button, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import { TodoDocument, CategoryDocument } from '../../shared/types';
import { CategoriesPicker } from './CategoriesPicker';
import '../styles/TodoList.css';

const { Text } = Typography;

interface TodoListProps {
  categoryId?: string;
}

export function TodoList({ categoryId = 'all' }: TodoListProps): React.ReactElement {
  const { todos, loading, updateTodo, deleteTodo, addTodoToCategory, removeTodoFromCategory } = useTodos(categoryId);
  const { categories } = useCategories();

  // Structure data for tree table (grouped by completion status)
  const tableData = useMemo(() => {
    // Separate incomplete and complete todos
    const incompleteTodos = todos.filter((todo: TodoDocument) => !todo.completed);
    const completeTodos = todos.filter((todo: TodoDocument) => todo.completed);

    // Prepare tree data structure
    return [
      {
        key: 'incomplete',
        title: `Incomplete (${incompleteTodos.length})`,
        children: incompleteTodos.map((todo: TodoDocument) => ({
          key: todo._id,
          todo: todo
        }))
      },
      {
        key: 'complete',
        title: `Complete (${completeTodos.length})`,
        children: completeTodos.map((todo: TodoDocument) => ({
          key: todo._id,
          todo: todo
        }))
      }
    ];
  }, [todos]);

  const handleToggleComplete = useCallback((todo: TodoDocument) => {
    updateTodo(todo, { completed: !todo.completed });
  }, [updateTodo]);

  const handleUpdateTitle = useCallback((todo: TodoDocument, newTitle: string) => {
    updateTodo(todo, { title: newTitle });
  }, [updateTodo]);

  const handleDeleteTodo = useCallback((todo: TodoDocument) => {
    deleteTodo(todo);
  }, [deleteTodo]);

  const handleAddCategory = useCallback((todo: TodoDocument, category: { _id: string }) => {
    addTodoToCategory(todo, category._id);
  }, [addTodoToCategory]);

  const handleRemoveCategory = useCallback((todo: TodoDocument, categoryId: string) => {
    removeTodoFromCategory(todo, categoryId);
  }, [removeTodoFromCategory]);

  // Get category name by ID
  const getCategoryName = useCallback((categoryId: string) => {
    const category = categories.find((c: CategoryDocument) => c._id === categoryId);
    return category ? category.name : 'Unknown';
  }, [categories]);

  // Table columns configuration
  const columns = [
    {
      title: 'To-Do',
      dataIndex: 'todo',
      key: 'title',
      width: 300,
      fixed: 'left' as const,
      render: (todo: TodoDocument, record: any) => {
        if (!todo) return (
          <span style={{ fontWeight: 'bold' }}>{record.title}</span>
        ); // For group headers
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Checkbox
              checked={todo.completed}
              onChange={() => handleToggleComplete(todo)}
            />
            <Text
              className="editable-cell"
              ellipsis={{ tooltip: todo.title }}
              editable={{
                onChange: (newTitle) => handleUpdateTitle(todo, newTitle),
                tooltip: 'Click to edit'
              }}
              style={{ width: '100%', display: 'block' }}
            >
              {todo.title}
            </Text>
          </div>
        );
      }
    },
    {
      title: 'Categories',
      dataIndex: 'todo',
      key: 'categories',
      width: 300,
      render: (todo: TodoDocument) => {
        if (!todo) return null; // For group headers
        return (
          <Space size={[0, 4]} wrap>
            {todo.categoryIds.map(catId => (
              <Tag 
                key={catId}
                closable
                onClose={(e) => {
                  e.preventDefault();
                  handleRemoveCategory(todo, catId);
                }}
              >
                {getCategoryName(catId)}
              </Tag>
            ))}
            <CategoriesPicker
              categories={categories}
              assignedCategories={todo.categoryIds}
              onCategorySelect={(category) => handleAddCategory(todo, category)}
            />
          </Space>
        );
      }
    },
    {
      title: 'Created',
      dataIndex: 'todo',
      key: 'created',
      width: 120,
      render: (todo: TodoDocument) => {
        if (!todo) return null; // For group headers
        // Format date (without time)
        return new Date(todo.createdAt).toLocaleDateString();
      }
    },
    {
      title: '',
      dataIndex: 'todo',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (todo: TodoDocument) => {
        if (!todo) return null; // For group headers
        return (
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteTodo(todo)}
            />
          </Tooltip>
        );
      }
    }
  ];

  return (
    <Table
      dataSource={tableData}
      columns={columns}
      rowKey="key"
      loading={loading}
      pagination={false}
      size="small"
      expandable={{
        defaultExpandAllRows: true
      }}
      scroll={{ x: 'max-content', y: 'calc(100vh - 120px)' }}
      indentSize={0}
      style={{ height: '100%' }}
      className="todo-list-table"
    />
  );
} 