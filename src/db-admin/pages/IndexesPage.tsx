import React, { useState, useEffect } from 'react';
import { 
  Typography, Alert, Button, Card, Row, Col, 
  Modal, Form, Input, Select, Popconfirm, message, Tag
} from 'antd';
import { PlusOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons';
import { usePouchDB } from '../../shared/contexts/PouchDBProvider';

const { Title, Text } = Typography;
const { Option } = Select;

// Define interface extending PouchDB.Find.Index to ensure compatibility
interface Index extends Omit<PouchDB.Find.Index, 'ddoc'> {
  ddoc: string; // Make ddoc required
  def: {
    fields: Array<{[key: string]: string}>;
  };
}

export function IndexesPage(): React.ReactElement {
  const { db } = usePouchDB();
  const [indexes, setIndexes] = useState<Index[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [fields, setFields] = useState<{name: string, direction: 'asc' | 'desc'}[]>([{name: '', direction: 'asc'}]);

  const fetchIndexes = async () => {
    try {
      setLoading(true);
      const result = await db.getIndexes();
      // Filter out the _all_docs index which is the primary index and transform to our Index type
      const userIndexes = result.indexes
        .filter(idx => idx.name !== '_all_docs')
        .filter(idx => idx.ddoc !== null) // Filter out indexes with null ddoc
        .map(idx => ({
          ...idx,
          ddoc: idx.ddoc as string // Type assertion since we filtered nulls
        }));
      setIndexes(userIndexes as Index[]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to fetch indexes', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndexes();
  }, [db]);

  const handleAddField = () => {
    setFields([...fields, {name: '', direction: 'asc'}]);
  };

  const handleRemoveField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const handleFieldChange = (index: number, key: 'name' | 'direction', value: string) => {
    const newFields = [...fields];
    if (key === 'direction') {
      newFields[index].direction = value as 'asc' | 'desc';
    } else {
      newFields[index].name = value;
    }
    setFields(newFields);
  };

  const handleCreateIndex = async (values: any) => {
    try {
      setLoading(true);
      const indexFields = fields
        .filter(field => field.name.trim() !== '')
        .map(field => ({ [field.name]: field.direction }));

      if (indexFields.length === 0) {
        message.error('At least one field is required');
        return;
      }

      await db.createIndex({
        index: {
          fields: indexFields as any[], // Cast to any[] to satisfy TypeScript
          name: values.name,
          ddoc: `idx-${values.name}`
        }
      });
      
      message.success('Index created successfully');
      setIsModalVisible(false);
      form.resetFields();
      setFields([{name: '', direction: 'asc'}]);
      await fetchIndexes();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to create index', error);
      message.error(`Failed to create index: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIndex = async (index: Index) => {
    try {
      setLoading(true);
      await db.deleteIndex({
        ddoc: index.ddoc,
        name: index.name
      });
      message.success('Index deleted successfully');
      await fetchIndexes();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to delete index', error);
      message.error(`Failed to delete index: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Render field tags for the index card
  const renderFieldTags = (index: Index) => {
    return index.def.fields.map((field, idx) => {
      const fieldName = Object.keys(field)[0];
      const direction = field[fieldName];
      return (
        <Tag 
          key={idx} 
          color={direction === 'asc' ? 'blue' : 'purple'}
          style={{ marginBottom: '8px' }}
        >
          {fieldName}: {direction}
        </Tag>
      );
    });
  };

  if (error && !loading) {
    return <Alert type="error" message="Error" description={error.message} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2}>Database Indexes</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalVisible(true)}
        >
          Create Index
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text>Loading indexes...</Text>
        </div>
      ) : indexes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', background: '#f9f9f9', borderRadius: '4px' }}>
          <TagsOutlined style={{ fontSize: '24px', color: '#bfbfbf', marginBottom: '16px' }} />
          <Title level={5} style={{ color: '#8c8c8c' }}>No indexes found</Title>
          <Text type="secondary">Create your first index to improve query performance</Text>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {indexes.map(index => (
            <Col xs={24} sm={24} md={12} lg={12} xl={8} key={index.name}>
              <Card
                title={index.name}
                variant="outlined" 
                hoverable
                extra={
                  <Popconfirm
                    title="Are you sure you want to delete this index?"
                    onConfirm={() => handleDeleteIndex(index)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                      size="small"
                    />
                  </Popconfirm>
                }
              >
                <div style={{ marginBottom: '12px' }}>
                  <Text type="secondary">Design Doc:</Text>
                  <div style={{ wordBreak: 'break-all' }}>{index.ddoc}</div>
                </div>
                <div>
                  <Text type="secondary">Fields:</Text>
                  <div style={{ marginTop: '8px' }}>
                    {renderFieldTags(index)}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="Create New Index"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setFields([{name: '', direction: 'asc'}]);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateIndex}
        >
          <Form.Item
            name="name"
            label="Index Name"
            rules={[{ required: true, message: 'Please enter an index name' }]}
          >
            <Input placeholder="Enter index name" />
          </Form.Item>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ marginBottom: '8px', display: 'block' }}>Fields</label>
            
            {fields.map((field, index) => (
              <div key={index} style={{ display: 'flex', marginBottom: '8px' }}>
                <Input
                  placeholder="Field name"
                  value={field.name}
                  onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                <Select
                  value={field.direction}
                  onChange={(value) => handleFieldChange(index, 'direction', value)}
                  style={{ width: '100px', marginRight: '8px' }}
                >
                  <Option value="asc">ASC</Option>
                  <Option value="desc">DESC</Option>
                </Select>
                <Button 
                  danger 
                  onClick={() => handleRemoveField(index)}
                  disabled={fields.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            <Button 
              type="dashed" 
              onClick={handleAddField} 
              block
              icon={<PlusOutlined />}
            >
              Add Field
            </Button>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Index
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 