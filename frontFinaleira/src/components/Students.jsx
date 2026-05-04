import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const Students = () => {
  const { token, user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', registration: '', cpf: '', phone: '', address: '', userId: '' });
  const [editing, setEditing] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setStudents(data);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `${BASE_URL}/students/${editing.id}` : `${BASE_URL}/students`;

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
        setMessage(editing ? 'Aluno atualizado' : 'Aluno criado');
        setForm({ name: '', email: '', birthDate: '' });
        setEditing(null);
        fetchStudents();
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Erro na operação');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setForm({ name: student.name, registration: student.registration, cpf: student.cpf, phone: student.phone, address: student.address, userId: student.userId });
    setEditing(student);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setMessage('Aluno deletado');
        fetchStudents();
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

  const canCreate = user?.role === 'admin' || user?.role === 'professor';
  const canEdit = canCreate;
  const canDelete = user?.role === 'admin';

  return (
    <div className="students">
      <Link to="/dashboard">Voltar ao Dashboard</Link>
      <h2>Alunos</h2>
      {message && <p className="message">{message}</p>}
      {canCreate && (
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
            placeholder="Matrícula"
            value={form.registration}
            onChange={(e) => setForm({ ...form, registration: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="CPF"
            value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: e.target.value })}
          />
          <input
            type="text"
            placeholder="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            type="text"
            placeholder="Endereço"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <input
            type="number"
            placeholder="User ID"
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
            required
          />
          <button type="submit" disabled={loading}>
            {editing ? 'Atualizar' : 'Criar'}
          </button>
          {editing && <button onClick={() => setEditing(null)}>Cancelar</button>}
        </form>
      )}
      {loading ? <p>Carregando...</p> : (
        <ul>
          {students.map((student) => (
            <li key={student.id}>
              {student.name} - {student.registration} - {student.User?.email}
              {canEdit && <button onClick={() => handleEdit(student)}>Editar</button>}
              {canDelete && <button onClick={() => handleDelete(student.id)}>Deletar</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Students;