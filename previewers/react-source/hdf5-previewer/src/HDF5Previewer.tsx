import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import './styles.css';

import H5WasmApp from './H5WasmApp';

ReactDOM.render(
  <StrictMode>
    <H5WasmApp />
  </StrictMode>,
  document.querySelector('#root')
);
