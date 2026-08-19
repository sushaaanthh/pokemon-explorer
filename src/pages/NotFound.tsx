import logo from '../assets/branding/logo.png';
import { VaultLink } from '../components/VaultLink';
import './NotFound.css';

export function NotFound() {
  return (
    <main className="notfound-page">
      <div className="notfound">
        <div className="notfound__glow" aria-hidden="true" />
        <div className="notfound__logo-wrap">
          <img
            src={logo}
            alt=""
            className="notfound__logo"
            width="140"
            height="140"
            decoding="async"
          />
        </div>

        <div className="notfound__content">
          <p className="notfound__eyebrow">System Alert</p>
          <h1 className="notfound__code">404</h1>
          <p className="notfound__message">WILD PAGE APPEARED!</p>
          <p className="notfound__sub">
            PAGE NOT FOUND — The requested route has escaped into the tall grass.
          </p>

          <div className="notfound__actions">
            <VaultLink to="/" className="notfound__btn notfound__btn--primary">
              Back to Home
            </VaultLink>
            <VaultLink to="/" className="notfound__btn notfound__btn--secondary">
              Browse Pokédex
            </VaultLink>
          </div>
        </div>
      </div>
    </main>
  );
}
