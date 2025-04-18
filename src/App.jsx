import { useEffect, useRef } from 'react'
import './App.css'

function App() {
  const webviewRef = useRef(null);

  useEffect(() => {
    // Si necesitas manipular el webview después de que se monte
    const webview = webviewRef.current;
    if (webview) {
      webview.addEventListener('dom-ready', () => {
        console.log('WebView está listo');
        // Puedes agregar personalización adicional aquí
      });
    }
  }, []);

  return (
    <div className="app-container">
      <webview 
        ref={webviewRef}
        src="https://music.youtube.com/" 
        className="webview"
        allowpopups="true"
      ></webview>
    </div>
  )
}

export default App