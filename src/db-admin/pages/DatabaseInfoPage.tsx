import React, { useState, useEffect } from 'react';
import { Typography, Spin, Alert, Button, Upload, message, Space, Modal } from 'antd';
import { DownloadOutlined, UploadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { usePouchDB } from '../../shared/contexts/PouchDBProvider';
import type { UploadProps } from 'antd';

const { Title, Paragraph, Text } = Typography;
const { confirm } = Modal;

export function DatabaseInfoPage(): React.ReactElement {
  const { db } = usePouchDB();
  const [info, setInfo] = useState<PouchDB.Core.DatabaseInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const dbInfo = await db.info();
        setInfo(dbInfo);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Failed to fetch database info', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [db]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await db.allDocs({ include_docs: true });
      
      // Extract just the document content
      const documents = response.rows.map(row => row.doc);
      
      // Create a blob and download it
      const blob = new Blob([JSON.stringify(documents, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${info?.db_name || 'pouchdb'}-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      message.success('Database data downloaded successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to download database data', error);
      message.error(`Failed to download: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = (file: File) => {
    confirm({
      title: 'Replace all existing documents?',
      icon: <ExclamationCircleOutlined />,
      content: 'This will delete all current documents and replace them with the ones in the uploaded file. This action cannot be undone.',
      onOk() {
        processUpload(file);
      },
    });
    return false; // Prevent automatic upload
  };

  const processUpload = async (file: File) => {
    try {
      setUploading(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          if (!e.target?.result) throw new Error('Failed to read file');
          
          const content = e.target.result as string;
          const documents = JSON.parse(content);
          
          if (!Array.isArray(documents)) {
            throw new Error('Invalid format: expected an array of documents');
          }
          
          // Get all current documents to delete them
          const allDocs = await db.allDocs();
          
          // Delete all existing documents
          const deletePromises = allDocs.rows.map(row => {
            return db.remove(row.id, row.value.rev);
          });
          
          await Promise.all(deletePromises);
          
          // Insert new documents
          for (const doc of documents) {
            // Remove _rev to avoid conflicts
            if (doc._rev) delete doc._rev;
            await db.put(doc);
          }
          
          // Refresh database info
          const dbInfo = await db.info();
          setInfo(dbInfo);
          
          message.success(`Successfully imported ${documents.length} documents`);
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          console.error('Failed to process upload', error);
          message.error(`Failed to import: ${error.message}`);
        } finally {
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        message.error('Failed to read the file');
        setUploading(false);
      };
      
      reader.readAsText(file);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to upload database data', error);
      message.error(`Failed to upload: ${error.message}`);
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: handleUpload,
    showUploadList: false,
    accept: '.json',
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Loading database info...">
          <div style={{ height: 50 }} />
        </Spin>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message="Error" description={error.message} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Database Information</Title>
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            loading={downloading}
          >
            Download Data
          </Button>
          <Upload {...uploadProps}>
            <Button 
              icon={<UploadOutlined />}
              loading={uploading}
            >
              Upload Data
            </Button>
          </Upload>
        </Space>
      </div>
      
      {info && (
        <div className="info-container" style={{ marginTop: '16px' }}>
          <Typography>
            <Paragraph>
              <Text strong>Database Name:</Text> {info.db_name}
            </Paragraph>
            <Paragraph>
              <Text strong>Doc Count:</Text> {info.doc_count}
            </Paragraph>
            <Paragraph>
              <Text strong>Update Sequence:</Text> {String(info.update_seq)}
            </Paragraph>
            
            <Title level={4} style={{ marginTop: '24px' }}>Raw Database Info</Title>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px', 
              overflow: 'auto' 
            }}>
              {JSON.stringify(info, null, 2)}
            </pre>
          </Typography>
        </div>
      )}
    </div>
  );
} 