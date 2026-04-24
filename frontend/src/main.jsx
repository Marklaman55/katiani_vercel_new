import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

console.log("🛠️ FRONTEND ENV:", import.meta.env);

createRoot(document.getElementById('root')).render(
  <App />
);
