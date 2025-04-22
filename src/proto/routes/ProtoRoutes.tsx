import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SpacePage } from '../pages/SpacePage';

export default function ProtoRoutes(): React.ReactElement {
  return (
    <Routes>
      {/* Root route for the prototype slice automatically routes to the space page */}
      <Route path="/" element={<Navigate to="/space" replace />} />
      
      {/* Space page with query parameters for spaceId and userId */}
      <Route path="/space" element={<SpacePage />} />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/space" replace />} />
    </Routes>
  );
} 