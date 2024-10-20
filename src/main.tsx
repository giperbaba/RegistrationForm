import { createRoot, Root } from 'react-dom/client'
import './index.css'
import App from './App';

const root: Root = createRoot(document.getElementById('root')!)

root.render(<App />);
 