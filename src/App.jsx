import React from 'react';
import Sidebar from './components/Sidebar';

const App = () => {
  return (
    <div className="app-container">
      <nav className="mainnav flex">
        <img style={{ maxWidth: '50px' }} src="images/logo.png" alt="Logo" className="logo" />
      </nav>
      <Sidebar />
      <canvas id="nodes-canvas"></canvas>
      <section className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>Visual Organization</h3>
            <p>See your knowledge as an interactive network of connected ideas.</p>
          </div>
          <div className="feature">
            <h3>Smart Connections</h3>
            <p>Automatically discover relationships between your notes.</p>
          </div>
          <div className="feature">
            <h3>Easy Editing</h3>
            <p>Simple and intuitive interface for managing your knowledge base.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
