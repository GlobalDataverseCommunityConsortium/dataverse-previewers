import { App } from '@h5web/app';
import { H5WasmProvider } from '@h5web/h5wasm';
import { useState } from 'react';

import Loader from './Loader';

export interface H5File {
  filename: string;
  buffer: ArrayBuffer;
}

function H5WasmApp() {
  const [h5File, setH5File] = useState<H5File>();

  if (!h5File) {
    return <Loader onH5File={setH5File} />;
  }

  return (
    <H5WasmProvider {...h5File}>
      <App sidebarOpen disableDarkMode />
    </H5WasmProvider>
  );
}

export default H5WasmApp;
