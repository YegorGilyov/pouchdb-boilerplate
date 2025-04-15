import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { MainLayout } from './layouts/MainLayout';
import { AppRoutes } from './routes/Routes';
import { PouchDBProvider } from '../shared/contexts/PouchDBProvider';
import './styles/App.css';

function App() {
  return (
    <ConfigProvider>
      <AntApp>
        <BrowserRouter>
          <PouchDBProvider>
            <MainLayout>
              <AppRoutes />
            </MainLayout>
          </PouchDBProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
