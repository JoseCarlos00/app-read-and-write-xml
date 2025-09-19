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
            height: '38px',
            lineHeight: 'normal',
            backgroundColor: '#0d1117',
            paddingBottom: '12px',
          }}
          className="titlebar"
        >
          <Tools />
        </Header>
        <Content style={{ flex: 1 }}>
          <TabsManager />
        </Content>
      </Layout>
    </>
  );
}

export default App;
