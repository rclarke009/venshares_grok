import { Link } from 'react-router-dom';
import Footer from './components/Footer'; // adjust path if needed

export default function HomePage() {
  return (
    <>
      <header className="header">
        <div className="logo">VENSHARES</div>
        <nav className="nav">
          <button className="nav-btn">HOME</button>
            <Link to="/contact" className="nav-btn">CONTACT US</Link>
          <Link to="/login" className="nav-btn">LOGIN/JOIN</Link>
        </nav>
      </header>
      <main className="main-content">
        <div className="quote-bg">
          <div className="quote">
            If you find a job you love, you'll never work again...
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}