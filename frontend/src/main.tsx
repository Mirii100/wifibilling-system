import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

console.log("main.tsx loading...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Failed to find the root element");
  document.body.innerHTML = '<h1 style="color:red; padding: 20px;">CRITICAL ERROR: Failed to find #root element in index.html</h1>';
} else {
  try {
    console.log("Starting React render...");
    createRoot(rootElement).render(
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>,
    )
    console.log("React render call completed.");
  } catch (err) {
    console.error("React Render Error:", err);
    rootElement.innerHTML = `<h1 style="color:red; padding: 20px;">React Render Error: ${err}</h1>`;
  }
}

window.onerror = function(message, _source, _lineno, _colno, error) {
  console.error("Global Error Caught:", message, error);
  if (rootElement) {
    rootElement.innerHTML += `<div style="color:red; padding: 20px; border: 1px solid red; margin: 10px;">
      <h3>Global JS Error</h3>
      <p>${message}</p>
    </div>`;
  }
};
