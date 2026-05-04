import { useAuth } from './components/AuthContext';
import { Link, Navigate } from 'react-router-dom';

function App() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="app">
      <h1>Sistema Escolar</h1>
      <nav>
        <Link to="/login">Login</Link> | <Link to="/register">Registrar</Link>
      </nav>
    </div>
  );
}

export default App;
