import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from './features/store.js'
import { Provider } from 'react-redux'
import '@fortawesome/fontawesome-free/css/all.min.css';


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
