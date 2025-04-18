import React, { useState } from 'react';
import { 
  Typography, Spin, Alert, Button, Table, 
  Input, Space, Divider
} from 'antd';
import { 
  SearchOutlined, ClearOutlined, 
  DatabaseOutlined 
} from '@ant-design/icons';
import { usePouchDB } from '../../shared/contexts/PouchDBProvider';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Simple interface for query results
interface QueryResult {
  _id: string;
  _rev: string;
  [key: string]: any;
}

export function QueryEditorPage(): React.ReactElement {
  const { db } = usePouchDB();
  const [queryText, setQueryText] = useState<string>('{\n  "selector": {\n    "type": "todo"\n  }\n}');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [queryTime, setQueryTime] = useState<number | null>(null);

  const clearResults = () => {
    setResults([]);
    setError(null);
    setQueryTime(null);
  };

  const executeQuery = async () => {
    try {
      setLoading(true);
      setError(null);
      clearResults();
      
      let parsedQuery: any;

      try {
        parsedQuery = JSON.parse(queryText);
      } catch (error) {
        const parseErr = error as Error;
        throw new Error(`Invalid JSON: ${parseErr.message}`);
      }

      const startTime = performance.now();
      const result = await db.find(parsedQuery);
      const endTime = performance.now();
      
      setResults(result.docs as QueryResult[]);
      setQueryTime(endTime - startTime);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Query execution failed', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic columns based on first result
  const getColumns = () => {
    if (results.length === 0) return [];

    // Get all unique keys from all results
    const allKeys = new Set<string>();
    results.forEach(result => {
      Object.keys(result).forEach(key => allKeys.add(key));
    });

    // Always show _id first
    return Array.from(allKeys)
      .sort((a, b) => {
        if (a === '_id') return -1;
        if (b === '_id') return 1;
        if (a === '_rev') return -1;
        if (b === '_rev') return 1;
        return a.localeCompare(b);
      })
      .map(key => ({
        title: key,
        dataIndex: key,
        key,
        render: (value: any) => {
          if (value === undefined || value === null) return <Text type="secondary">null</Text>;
          if (typeof value === 'object') return <Text code>{JSON.stringify(value)}</Text>;
          return value.toString();
        }
      }));
  };

  const queryPlaceholder = `{
  "selector": {
    "type": "todo",
    "createdAt": { "$gte": null },
    "categoryIds": { "$size": 0 }
  },
  "sort": [ 
    { "type": "desc" }, 
    { "createdAt": "desc" }
  ],
  "use_index": ["_design/idx-type-createdAt-categoryIds", "idx-type-createdAt-categoryIds"]
}`;

  return (
    <div>
      <div className="query-editor-container">
        <Title level={2}>MongoDB-Style Query</Title>
        <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
          Use the Mango query syntax to search for documents. Enter a JSON object with 'selector' property. 
          You can also use 'fields', 'sort', 'use_index', and 'limit'.
        </Text>

        <TextArea
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder={queryPlaceholder}
          autoSize={{ minRows: 5, maxRows: 16 }}
          style={{ fontFamily: 'monospace' }}
        />

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <Space>
            <Button 
              icon={<ClearOutlined />} 
              onClick={() => setQueryText('')}
            >
              Clear
            </Button>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={executeQuery}
              loading={loading}
            >
              Execute Query
            </Button>
          </Space>
        </div>
      </div>

      <div className="query-results-container">
        <Divider />
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <Spin size="large" tip="Executing query...">
              <div style={{ height: 50 }} />
            </Spin>
          </div>
        ) : error ? (
          <Alert type="error" message="Query Error" description={error.message} />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Space>
                <DatabaseOutlined />
                <Title level={5} style={{ margin: 0 }}>Query Results</Title>
                {queryTime !== null && (
                  <Text type="secondary">({queryTime.toFixed(2)}ms)</Text>
                )}
                <Text>{results.length} document(s) found</Text>
              </Space>
              <Button icon={<ClearOutlined />} onClick={clearResults}>
                Clear Results
              </Button>
            </div>

            <Table 
              dataSource={results} 
              columns={getColumns()} 
              rowKey="_id"
              pagination={{ pageSize: 5, position: ['bottomLeft'] }}
              scroll={{ x: 'max-content' }}
              bordered={false}
            />
          </>
        )}
      </div>
      
    </div>
  );
}
 