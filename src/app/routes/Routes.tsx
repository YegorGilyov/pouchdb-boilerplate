import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TodoPage } from '../../todo/pages/TodoPage';

// Lazy load the DB Admin routes
const DbAdminRoutes = React.lazy(() => import('../../db-admin/routes/DbAdminRoutes'));
// Lazy load the Prototype routes
const ProtoRoutes = React.lazy(() => import('../../proto/routes/ProtoRoutes'));

export function AppRoutes(): React.ReactElement {
  return (
    <Routes>
      <Route path="/todos" element={<TodoPage />} />
      
      {/* DB admin section routes - lazily loaded */}
      <Route path="/db-admin/*" element={
        <Suspense fallback={<div>Loading...</div>}>
          <DbAdminRoutes />
        </Suspense>
      } />
      
      {/* Prototype section routes - lazily loaded */}
      <Route path="/proto/*" element={
        <Suspense fallback={<div>Loading...</div>}>
          <ProtoRoutes />
        </Suspense>
      } />
      
      <Route path="*" element={<Navigate to="/todos" replace />} />
    </Routes>
  );
} 