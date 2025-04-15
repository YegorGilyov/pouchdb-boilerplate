import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DbAdminLayout } from '../layouts/DbAdminLayout';
import { 
  DatabaseInfoPage, 
  IndexesPage, 
  AllDocumentsPage, 
  QueryEditorPage 
} from '../pages';

export function DbAdminRoutes(): React.ReactElement {
  return (
    <DbAdminLayout>
      <Routes>
        <Route path="info" element={<DatabaseInfoPage />} />
        <Route path="indexes" element={<IndexesPage />} />
        <Route path="documents" element={<AllDocumentsPage />} />
        <Route path="query" element={<QueryEditorPage />} />
        <Route path="*" element={<Navigate to="/db-admin/info" replace />} />
      </Routes>
    </DbAdminLayout>
  );
}

export default DbAdminRoutes; 