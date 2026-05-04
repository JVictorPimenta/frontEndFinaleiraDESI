import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const Grades = () => {
  const { token, user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ studentId: '', classId: '', grade: '' });
  const [editing, setEditing] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gradeRes, studRes, classRes] = await Promise.all([
        fetch(`${BASE_URL}/grades`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/students`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/classes`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const gradeData = await gradeRes.json();
      const studData = await studRes.json();
      const classData = await classRes.json();
      if (gradeRes.ok) setGrades(gradeData);
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
    const url = editing ? `${BASE_URL}/grades/${editing.id}` : `${BASE_URL}/grades`;

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
        setMessage(editing ? 'Nota atualizada' : 'Nota criada');
        setForm({ studentId: '', classId: '', grade: '' });
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

  const handleEdit = (grade) => {
    setForm({ studentId: grade.studentId, classId: grade.classId, grade: grade.grade });
    setEditing(grade);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/grades/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setMessage('Nota deletada');
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

  const canCreate = user?.role === 'admin' || user?.role === 'professor';
  const canEdit = canCreate;
  const canDelete = user?.role === 'admin';

  return (
    <div className="grades">
      <Link to="/dashboard">Voltar ao Dashboard</Link>
      <h2>Notas</h2>
      {message && <p className="message">{message}</p>}
      {canCreate && (
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
          <input
            type="number"
            placeholder="Nota"
            value={form.grade}
            onChange={(e) => setForm({ ...form, grade: e.target.value })}
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
          {grades.map((grade) => (
            <li key={grade.id}>
              Aluno: {students.find(s => s.id === grade.studentId)?.name} - Turma: {classes.find(c => c.id === grade.classId)?.name} - Nota: {grade.grade}
              {canEdit && <button onClick={() => handleEdit(grade)}>Editar</button>}
              {canDelete && <button onClick={() => handleDelete(grade.id)}>Deletar</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Grades;