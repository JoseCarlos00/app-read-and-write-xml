import { Layout } from 'antd';

import OpenFile from './components/OpenFile';
import TabsManager from './view/TabsManager';
import Tools from './view/Tools';
import { InitialData } from './hooks/addInitialData';

const { Header, Content } = Layout;

function App() {
  return (
    <>
      <InitialData />
      <OpenFile />
      <Layout
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0d1117',
        }}
      >
        <Header
          style={{
            padding: 0,
            height: 'auto',
            lineHeight: 'normal',
            backgroundColor: '#0d1117',
          }}
        >
          <Tools />
        </Header>
        <Content style={{ flex: 1, overflowY: 'auto' }}>
          <TabsManager />
        </Content>
      </Layout>
    </>
  );
}

export default App;
