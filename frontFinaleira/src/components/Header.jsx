import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link to="/" className="brand">
          <strong>Finaleira DESI</strong>
          <span>Portal escolar</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" className="nav-link">
            Inicio
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className="nav-link">
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-chip">
                {user.email}
                <small>{user.role}</small>
              </span>
              <button type="button" className="ghost-button" onClick={logout}>
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className="cta-primary">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
