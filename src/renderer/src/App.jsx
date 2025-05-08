import { useEffect, useRef } from 'react';
import Versions from './components/Versions';
import Test from './components/TestDesign';

let activeTab = null;
let files = []; // Array para almacenar los archivos abiertos

function App() {
  const fileContents = useRef(null);
  const fileTabs = useRef(null);

  // const ipcHandle = () => window.electron.ipcRenderer.send('ping');
  const displayFileContent = (filePath) => {
    const file = files.find((f) => f.path === filePath);
    if (file) {
      if (file.error) {
        fileContents.current.value = `Error al leer el archivo: ${file.error}`;
      } else {
        fileContents.current.value = file.content;
      }
    } else {
      fileContents.current.value = ''; // Limpia el contenido si no hay archivo seleccionado
    }
  };

  const updateActiveTab = () => {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab) => {
      tab.classList.remove('active');
    });
    const activeTabElement = document.querySelector(
      `.tab[data-file-path="${activeTab}"]`,
    );
    if (activeTabElement) {
      activeTabElement.classList.add('active');
    }
  };

  const createTab = (filePath) => {
    const tab = document.createElement('div');
    tab.classList.add('tab');
    tab.textContent = filePath.split('\\').pop(); // Muestra solo el nombre del archivo
    tab.dataset.filePath = filePath;
    tab.addEventListener('click', () => {
      activeTab = filePath;
      displayFileContent(filePath);
      updateActiveTab(); // Actualiza la pestaña activa visualmente
    });
    fileTabs.current.appendChild(tab);
    updateActiveTab();
  };

  const handleOpenFile = async () => {
    const newFiles = await window.electronAPI.openFile(); // Usa la API expuesta
    console.log('newFiles:', newFiles);

    if (newFiles && newFiles.length > 0) {
      newFiles.forEach((file) => {
        if (files.find((f) => f.path === file.path)) return; // Evita duplicados
        files.push(file); // Agrega al array
        createTab(file.path);
        if (!activeTab) {
          activeTab = file.path;
        }
      });
      displayFileContent(activeTab); // Muestra el contenido del primer archivo o del archivo seleccionado
    }
  };

  useEffect(() => {
    // Escuchar el evento desde el menú para abrir el archivo
    window.ipcRenderer.openFileEvent(handleOpenFile);
  }, []);

  return (
    <>
      <Test />
      <header>
        <h1>Editor de XML</h1>
      </header>
      <main>
        <button id="open-file-button" onClick={handleOpenFile}>
          Abrir Archivo
        </button>
        <button id="save-button">Guardar Archivo</button>
        <div id="file-tabs" ref={fileTabs}></div>
        <textarea id="file-contents" ref={fileContents}></textarea>
      </main>
      <footer>
        <p>Derechos Reservados © 2024</p>
      </footer>
      <Versions></Versions>
    </>
  );
}

export default App;
