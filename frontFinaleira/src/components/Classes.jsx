import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const Classes = () => {
  const { token, user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', description: '', schedule: '', room: '' });
  const [editing, setEditing] = useState(null);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setClasses(data);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `${BASE_URL}/classes/${editing.id}` : `${BASE_URL}/classes`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(editing ? 'Turma atualizada' : 'Turma criada');
        setForm({ name: '', description: '' });
        setEditing(null);
        fetchClasses();
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Erro na operação');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cls) => {
    setForm({ name: cls.name, description: cls.description, schedule: cls.schedule, room: cls.room });
    setEditing(cls);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/classes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setMessage('Turma deletada');
        fetchClasses();
      } else {
        const data = await response.json();
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Erro ao deletar');
    } finally {
      setLoading(false);
    }
  };

  const canCRUD = user?.role === 'admin';

  return (
    <div className="classes">
      <Link to="/dashboard">Voltar ao Dashboard</Link>
      <h2>Turmas</h2>
      {message && <p className="message">{message}</p>}
      {canCRUD && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Horário"
            value={form.schedule}
            onChange={(e) => setForm({ ...form, schedule: e.target.value })}
          />
          <input
            type="text"
            placeholder="Sala"
            value={form.room}
            onChange={(e) => setForm({ ...form, room: e.target.value })}
          />
          <button type="submit" disabled={loading}>
            {editing ? 'Atualizar' : 'Criar'}
          </button>
          {editing && <button onClick={() => setEditing(null)}>Cancelar</button>}
        </form>
      )}
      {loading ? <p>Carregando...</p> : (
        <ul>
          {classes.map((cls) => (
            <li key={cls.id}>
              {cls.name} - {cls.description} - {cls.schedule} - {cls.room}
              {canCRUD && <button onClick={() => handleEdit(cls)}>Editar</button>}
              {canCRUD && <button onClick={() => handleDelete(cls.id)}>Deletar</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Classes;