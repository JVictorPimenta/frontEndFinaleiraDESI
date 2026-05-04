import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const Enrollments = () => {
  const { token, user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ studentId: '', classId: '' });
  const [editing, setEditing] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [enrollRes, studRes, classRes] = await Promise.all([
        fetch(`${BASE_URL}/enrollments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/students`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/classes`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const enrollData = await enrollRes.json();
      const studData = await studRes.json();
      const classData = await classRes.json();
      if (enrollRes.ok) setEnrollments(enrollData);
      if (studRes.ok) setStudents(studData);
      if (classRes.ok) setClasses(classData);
    } catch (error) {
      setMessage('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `${BASE_URL}/enrollments/${editing.id}` : `${BASE_URL}/enrollments`;

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
        setMessage(editing ? 'Inscrição atualizada' : 'Inscrição criada');
        setForm({ studentId: '', classId: '' });
        setEditing(null);
        fetchData();
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Erro na operação');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (enrollment) => {
    setForm({ studentId: enrollment.studentId, classId: enrollment.classId });
    setEditing(enrollment);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/enrollments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setMessage('Inscrição deletada');
        fetchData();
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
    <div className="enrollments">
      <Link to="/dashboard">Voltar ao Dashboard</Link>
      <h2>Inscrições</h2>
      {message && <p className="message">{message}</p>}
      {canCRUD && (
        <form onSubmit={handleSubmit}>
          <select
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            required
          >
            <option value="">Selecione Aluno</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={form.classId}
            onChange={(e) => setForm({ ...form, classId: e.target.value })}
            required
          >
            <option value="">Selecione Turma</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="submit" disabled={loading}>
            {editing ? 'Atualizar' : 'Criar'}
          </button>
          {editing && <button onClick={() => setEditing(null)}>Cancelar</button>}
        </form>
      )}
      {loading ? <p>Carregando...</p> : (
        <ul>
          {enrollments.map((enrollment) => (
            <li key={enrollment.id}>
              Aluno: {students.find(s => s.id === enrollment.studentId)?.name} - Turma: {classes.find(c => c.id === enrollment.classId)?.name}
              {canCRUD && <button onClick={() => handleEdit(enrollment)}>Editar</button>}
              {canCRUD && <button onClick={() => handleDelete(enrollment.id)}>Deletar</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Enrollments;