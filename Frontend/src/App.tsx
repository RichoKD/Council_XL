import { WalletConnect } from './components/WalletConnect';
import { CouncilUI } from './components/CouncilUI';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <div className="blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <header className="app-header glass-panel">
        <div className="header-brand">
          <h1>Council_XL</h1>
          <span className="badge">0G Inference</span>
        </div>
        <div className="header-actions">
          <WalletConnect />
        </div>
      </header>

      <main className="app-main">
        <section className="intro-section glass-panel">
          <p className="intro-text">
            Submit your idea to the decentralized AI Council. They will rigorously stress-test and synthesize a flawless implementation plan.
          </p>
        </section>

        <section className="action-section">
          <CouncilUI />
        </section>
      </main>

      <footer className="app-footer glass-panel">
        <p>Powered by 0G Private Computer and the Decentralized AI Council</p>
      </footer>
    </div>
  )
}

export default App
