import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <p>Você precisa estar logado.</p>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p>Bem-vindo, {user.email}!</p>
      <p>Role: {user.role}</p>
      <nav>
        <ul>
          <li><Link to="/students">Gerenciar Alunos</Link></li>
          <li><Link to="/classes">Gerenciar Turmas</Link></li>
          <li><Link to="/enrollments">Gerenciar Inscrições</Link></li>
          <li><Link to="/grades">Gerenciar Notas</Link></li>
        </ul>
      </nav>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;