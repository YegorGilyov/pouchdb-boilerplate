import React, { useState, useEffect } from 'react';
import { 
  Typography, Alert, Table, Button, 
  Popconfirm, Space, Modal, message
} from 'antd';
import { EyeOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import { usePouchDB } from '../../shared/contexts/PouchDBProvider';

const { Title, Text } = Typography;

// Define a type that has all required fields for PouchDB operations
interface PouchDocument {
  _id: string;
  _rev: string;
  type: string;
  [key: string]: any; // Allow any other properties
}

export function AllDocumentsPage(): React.ReactElement {
  const { db } = usePouchDB();
  const [documents, setDocuments] = useState<PouchDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [selectedDoc, setSelectedDoc] = useState<PouchDocument | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Fetch all documents using allDocs with include_docs option
      const result = await db.allDocs({
        include_docs: true,
        attachments: true
      });
      
      // Filter and transform documents to match our expected type
      const docs = result.rows
        .filter(row => row.doc && !row.doc._id.startsWith('_design/'))
        .map(row => row.doc as PouchDocument) // Type assertion for filtered docs
        .filter(doc => doc._rev !== undefined); // Ensure _rev exists
      
      setDocuments(docs);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to fetch documents', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [db]);

  const handleViewDocument = (doc: PouchDocument) => {
    setSelectedDoc(doc);
    setViewModalVisible(true);
  };

  const handleDeleteDocument = async (doc: PouchDocument) => {
    try {
      setLoading(true);
      await db.remove(doc._id, doc._rev);
      message.success('Document deleted successfully');
      await fetchDocuments();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to delete document', error);
      setError(error);
      message.error(`Failed to delete document: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      ellipsis: true
    },
    {
      title: 'Rev',
      dataIndex: '_rev',
      key: '_rev',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PouchDocument) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDocument(record)}
            type="primary"
            size="small"
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this document?"
            onConfirm={() => handleDeleteDocument(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error && !loading) {
    return <Alert type="error" message="Error" description={error.message} />;
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px - 48px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={2}>All Documents</Title>
          <Button
            icon={<SyncOutlined />}
            onClick={fetchDocuments}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
        <div style={{ 
          flex: 1,
          overflow: 'auto',
          paddingTop: '16px',
          padding: '0'
        }}>
          <Table 
            dataSource={documents} 
            columns={columns} 
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            bordered={false}
            style={{ height: '100%' }}
            scroll={{ y: 'calc(100vh - 285px)' }}
          />
        </div>
      </div>


      <Modal
        title="Document Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedDoc && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>ID:</Text> {selectedDoc._id}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Type:</Text> {selectedDoc.type}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Revision:</Text> {selectedDoc._rev}
            </div>
            <Text strong>Document Data:</Text>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px', 
              maxHeight: '400px', 
              overflow: 'auto',
              marginTop: '8px'
            }}>
              {JSON.stringify(selectedDoc, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </>
  );
} 