import { dialog } from 'electron';
import fs from 'node:fs/promises';

export interface OpenedFile {
  path: string;
  content?: string;
  error?: string;
}

export async function openFile(
  mainWindow: Electron.BrowserWindow | null,
): Promise<OpenedFile[]> {
  if (!mainWindow) return []; // Devuelve un array vacío si no hay ventana principal

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    filters: [
      {
        name: 'XML Files',
        extensions: ['xml', 'shxmlp', 'shxml', 'rcxml', 'recxmlp'],
      },
    ],
    properties: ['openFile', 'multiSelections'], // Permite abrir múltiples archivos
  });

  if (canceled) return []; // Devuelve un array vacío si se cancela

  const files: OpenedFile[] = [];

  for (const filePath of filePaths) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      files.push({ path: filePath, content });
    } catch (error) {
      console.error(`Error al leer el archivo: ${filePath}`, error);
      // Aquí podrías mostrar un mensaje de error al usuario
      files.push({ path: filePath, error: `No se pudo leer el archivo.` }); // Indica el error
    }
  }
  return files; // Devuelve un array de objetos con la ruta y el contenido (o error)
}

// Función para guardar archivo como
export async function saveFileAs(
  event: Electron.IpcMainInvokeEvent,
  { content, fileName = 'archivo' }: { content: string; fileName?: string },
) {
  try {
    if (!content) {
      throw new Error('No existe el  contenido para guardar');
    }

    const result = await dialog.showSaveDialog({
      title: 'Guardar archivo como',
      defaultPath: fileName,
      filters: [
        {
          name: 'Archivo XML',
          extensions: ['shxml', 'shxmlp', 'xml', 'recxmlP', 'rcxml'],
        },
      ],
    });

    if (!result.canceled && result.filePath) {
      console.log('saveFileAs:', result);
      try {
        await fs.writeFile(result.filePath, content, 'utf-8'); // Asegurar que la escritura se complete
        return { success: true, filePath: result.filePath };
      } catch (error) {
        console.error('Error al guardar el archivo:', error);
        return { success: false, error: error.message };
      }
    }

    return { success: false, error: 'El usuario canceló la acción' };
  } catch (error) {
    console.error('Error en el diálogo de guardar:', error);
    return { success: false, error: 'Error al intentar guardar el archivo' };
  }
}
