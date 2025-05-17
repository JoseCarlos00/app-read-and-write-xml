import OpenFile from './components/OpenFile';
import TabsManager from './view/TabsManager';
import Tools from './view/Tools';
import { InitialData } from './hooks/addInitialData';

function App() {
  return (
    <>
      {/* <InitialData /> */}
      <OpenFile />
      <Tools />
      <TabsManager />
    </>
  );
}

export default App;
