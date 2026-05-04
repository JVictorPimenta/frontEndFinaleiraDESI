import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  createClassroom,
  createDiscipline,
  createEnrollment,
  createGrade,
  createStudentProfile,
  deleteClassroom,
  deleteDiscipline,
  deleteEnrollment,
  deleteGrade,
  deleteUser,
  getClasses,
  getDisciplines,
  getEnrollments,
  getGrades,
  getStudents,
  getUsers,
  updateClassroom,
  updateDiscipline,
  updateEnrollment,
  updateUser,
} from '../api/schoolApi'

const initialProfessorForm = { email: '', password: '' }
const initialStudentForm = {
  email: '',
  password: '',
  name: '',
  registration: '',
  cpf: '',
  phone: '',
  address: '',
}
const initialClassForm = {
  name: '',
  description: '',
  schedule: '',
  room: '',
  professorId: '',
}
const initialDisciplineForm = {
  name: '',
  description: '',
  classId: '',
}
const initialEnrollmentForm = {
  studentId: '',
  classId: '',
  status: 'active',
}
const initialGradeForm = {
  studentId: '',
  disciplineId: '',
  score: '',
  semester: 1,
}
const initialUserEditForm = {
  email: '',
  role: 'aluno',
  password: '',
}

function extractMessage(error) {
  return error?.message || 'Nao foi possivel completar a operacao.'
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export default function Dashboard() {
  const { user, registerProfessor, registerStudent } = useAuth()
  const [users, setUsers] = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [disciplines, setDisciplines] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [adminSection, setAdminSection] = useState('users')
  const [adminUsersSection, setAdminUsersSection] = useState('professor')
  const [adminSchoolSection, setAdminSchoolSection] = useState('classes')

  const [professorForm, setProfessorForm] = useState(initialProfessorForm)
  const [studentForm, setStudentForm] = useState(initialStudentForm)
  const [classForm, setClassForm] = useState(initialClassForm)
  const [disciplineForm, setDisciplineForm] = useState(initialDisciplineForm)
  const [enrollmentForm, setEnrollmentForm] = useState(initialEnrollmentForm)
  const [gradeForm, setGradeForm] = useState(initialGradeForm)

  const [editingUserId, setEditingUserId] = useState(null)
  const [editingUserForm, setEditingUserForm] = useState(initialUserEditForm)
  const [editingClassId, setEditingClassId] = useState(null)
  const [editingDisciplineId, setEditingDisciplineId] = useState(null)

  const [userSearch, setUserSearch] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [classSearch, setClassSearch] = useState('')
  const [disciplineSearch, setDisciplineSearch] = useState('')
  const [enrollmentSearch, setEnrollmentSearch] = useState('')
  const [enrollmentStatus, setEnrollmentStatus] = useState('all')
  const [gradeSearch, setGradeSearch] = useState('')
  const [gradeDisciplineFilter, setGradeDisciplineFilter] = useState('all')
  const [professorGradeSearch, setProfessorGradeSearch] = useState('')

  async function loadDashboardData() {
    try {
      setLoading(true)
      setError('')

      const baseRequests = [
        getStudents(),
        getClasses(),
        getDisciplines(),
        getEnrollments(),
        getGrades(),
      ]

      const results = await Promise.all(
        user.role === 'admin' ? [getUsers(), ...baseRequests] : baseRequests
      )

      if (user.role === 'admin') {
        const [
          usersData,
          studentsData,
          classesData,
          disciplinesData,
          enrollmentsData,
          gradesData,
        ] = results

        setUsers(usersData)
        setStudents(studentsData)
        setClasses(classesData)
        setDisciplines(disciplinesData)
        setEnrollments(enrollmentsData)
        setGrades(gradesData)
      } else {
        const [studentsData, classesData, disciplinesData, enrollmentsData, gradesData] = results

        setUsers([])
        setStudents(studentsData)
        setClasses(classesData)
        setDisciplines(disciplinesData)
        setEnrollments(enrollmentsData)
        setGrades(gradesData)
      }
    } catch (requestError) {
      setError(extractMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function bootstrap() {
      try {
        setLoading(true)
        setError('')

        const baseRequests = [
          getStudents(),
          getClasses(),
          getDisciplines(),
          getEnrollments(),
          getGrades(),
        ]

        const results = await Promise.all(
          user.role === 'admin' ? [getUsers(), ...baseRequests] : baseRequests
        )

        if (!active) {
          return
        }

        if (user.role === 'admin') {
          const [
            usersData,
            studentsData,
            classesData,
            disciplinesData,
            enrollmentsData,
            gradesData,
          ] = results

          setUsers(usersData)
          setStudents(studentsData)
          setClasses(classesData)
          setDisciplines(disciplinesData)
          setEnrollments(enrollmentsData)
          setGrades(gradesData)
        } else {
          const [studentsData, classesData, disciplinesData, enrollmentsData, gradesData] = results

          setUsers([])
          setStudents(studentsData)
          setClasses(classesData)
          setDisciplines(disciplinesData)
          setEnrollments(enrollmentsData)
          setGrades(gradesData)
        }
      } catch (requestError) {
        if (active) {
          setError(extractMessage(requestError))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [user.role])

  const studentProfile = students.find((student) => student.userId === user?.id) || null
  const myEnrollments = studentProfile
    ? enrollments.filter((enrollment) => enrollment.studentId === studentProfile.id)
    : []
  const myGrades = studentProfile
    ? grades.filter((grade) => grade.studentId === studentProfile.id)
    : []

  const professorClasses = classes.filter((classe) => classe.professorId === user?.id)
  const professorClassIds = new Set(professorClasses.map((classe) => classe.id))
  const professorDisciplines = disciplines.filter((discipline) =>
    professorClassIds.has(discipline.classId)
  )
  const professorDisciplineIds = new Set(professorDisciplines.map((discipline) => discipline.id))
  const professorGrades = grades.filter((grade) => professorDisciplineIds.has(grade.disciplineId))

  const roleLabel = {
    admin: 'Administrador',
    professor: 'Professor',
    aluno: 'Aluno',
  }[user?.role] || user?.role

  const professors = users.filter((item) => item.role === 'professor')

  const filteredUsers = users.filter((item) =>
    normalizeText(item.email).includes(normalizeText(userSearch))
  )
  const filteredStudents = students.filter((student) =>
    normalizeText(student.name).includes(normalizeText(studentSearch))
  )
  const filteredClasses = classes.filter((classe) =>
    normalizeText(`${classe.name} ${classe.User?.email}`).includes(normalizeText(classSearch))
  )
  const filteredDisciplines = disciplines.filter((discipline) =>
    normalizeText(`${discipline.name} ${discipline.Class?.name}`).includes(
      normalizeText(disciplineSearch)
    )
  )
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesName = normalizeText(enrollment.Student?.name).includes(
      normalizeText(enrollmentSearch)
    )
    const matchesStatus = enrollmentStatus === 'all' || enrollment.status === enrollmentStatus
    return matchesName && matchesStatus
  })
  const filteredAdminGrades = grades.filter((grade) => {
    const matchesName = normalizeText(grade.Student?.name).includes(normalizeText(gradeSearch))
    const matchesDiscipline =
      gradeDisciplineFilter === 'all' || String(grade.disciplineId) === gradeDisciplineFilter
    return matchesName && matchesDiscipline
  })
  const filteredProfessorGrades = professorGrades.filter((grade) =>
    normalizeText(grade.Student?.name).includes(normalizeText(professorGradeSearch))
  )

  function resetMessages() {
    setError('')
    setSuccess('')
  }

  function disciplineLabel(discipline) {
    return `${discipline.name}${discipline.Class?.name ? ` - ${discipline.Class.name}` : ''}`
  }

  async function handleProfessorCreate(event) {
    event.preventDefault()

    try {
      setSubmitting(true)
      resetMessages()
      await registerProfessor(professorForm.email, professorForm.password)
      setSuccess('Professor cadastrado com sucesso.')
      setProfessorForm(initialProfessorForm)
      await loadDashboardData()
    } catch (requestError) {
      setError(extractMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStudentCreate(event) {
    event.preventDefault()

    try {
      setSubmitting(true)
      resetMessages()
      const studentUser = await registerStudent(studentForm.email, studentForm.password)
      await createStudentProfile({
        name: studentForm.name,
        registration: studentForm.registration,
        cpf: studentForm.cpf,
        phone: studentForm.phone,
        address: studentForm.address,
        userId: Number(studentUser.id),
      })
      setSuccess('Aluno cadastrado com sucesso.')
      setStudentForm(initialStudentForm)
      await loadDashboardData()
    } catch (requestError) {
      setError(extractMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUserUpdate(event) {
    event.preventDefault()

    try {
      setSubmitting(true)
      resetMessages()
      const payload = {
        email: editingUserForm.email,
        role: editingUserForm.role,
      }

      if (editingUserForm.password) {
        payload.password = editingUserForm.password
      }

      await updateUser(editingUserId, payload)
      setSuccess('Usuario atualizado com sucesso.')
      setEditingUserId(null)
      setEditingUserForm(initialUserEditForm)
      await loadDashboardData()
    } catch (requestError) {
      setError(extractMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteUser(targetUser) {
    try {
      setSubmitting(true)
      resetMessages()
      await deleteUser(targetUser.id)
      setSuccess('Usuario removido com sucesso.')
      await loadDashboardData()
    } catch (requestError) {
      setError(extractMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleClassSubmit(event) {
    event.preventDefault()

    try {
      setSubmitting(true)
      resetMessages()
      const payload = {
        ...classForm,
        professorId: classForm.professorId ? Number(classForm.professorId) : null,
      }

      if (editingClassId) {
        await updateClassroom(editingClassId, payload)
        setSuccess('Turma atualizada com sucesso.')
      } else {
        await createClassroom(payload)
        setSuccess('Turma cadastrada com sucesso.')
      }

      setClassForm(initialClassForm)
      setEditingClassId(null)
      await loadDashboardData()
    } catch (requestError) {
      setError(extractMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteClass(targetClass) {
    try {
      setSubmitting(true)
      resetMessages()
      await deleteClassroom(targetClass.id)
      setSuccess('Turma removida com sucesso.')
      await loadDashboardData()
    } catch (requestError) {
      setError(extractMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDisciplineSubmit(event) {
    event.preventDefault()

    try {
      setSubmitting(true)
      resetMessages()
      const payload = {
        ...disciplineForm,
        classId: Number(disciplineForm.classId),
      }

      if (editingDisciplineId) {
        await updateDiscipline(editingDisciplineId, payload)
        setSuccess('Disciplina atualizada com sucesso.')
      } else {
        await createDiscipline(payload)
        setSuccess('Disciplina cadastrada com sucesso.')
      }

      setDisciplineForm(initialDisciplineForm)
      setEditingDisciplineId(null)
      await loadDashboardData()
    } catch (requestError) {
      setError(extractMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteDiscipline(targetDiscipline) {
    try {
      setSubmitting(true)
      resetMessages()
      await deleteDiscipline(targetDiscipline.id)
      setSuccess('Disciplina removida com sucesso.')
      await loadDashboardData()
    } catch (requestError) {
      setError(extractMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEnrollmentCreate(event) {
    event.preventDefault()

    try {
      setSubmitting(true)
      resetMessages()
      await createEnrollment({
        studentId: Number(enrollmentForm.studentId),
        classId: Number(enrollmentForm.classId),
        status: enrollmentForm.status,
      })
      setSuccess('Matricula cadastrada com sucesso.')
      setEnrollmentForm(initialEnrollmentForm)
      await loadDashboardData()
    } catch (requestError) {
      setError(extractMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEnrollmentStatusChange(id, status) {
    try {
      setSubmitting(true)
      resetMessages()
      await updateEnrollment(id, { status })
      setSuccess('Matricula atualizada com sucesso.')
      await loadDashboardData()
    } catch (requestError) {
      setError(extractMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteEnrollment(id) {
    try {
      setSubmitting(true)
      resetMessages()
      await deleteEnrollment(id)
      setSuccess('Matricula removida com sucesso.')
      await loadDashboardData()
    } catch (requestError) {
      setError(extractMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGradeCreate(event) {
    event.preventDefault()

    try {
      setSubmitting(true)
      resetMessages()
      await createGrade({
        studentId: Number(gradeForm.studentId),
        disciplineId: Number(gradeForm.disciplineId),
        score: Number(gradeForm.score),
        semester: Number(gradeForm.semester),
      })
      setSuccess('Nota lancada com sucesso.')
      setGradeForm(initialGradeForm)
      await loadDashboardData()
    } catch (requestError) {
      setError(extractMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteGrade(id) {
    try {
      setSubmitting(true)
      resetMessages()
      await deleteGrade(id)
      setSuccess('Nota removida com sucesso.')
      await loadDashboardData()
    } catch (requestError) {
      setError(extractMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dashboard-stack">
      <section className="hero-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Painel principal</p>
            <h1 className="hero-title">Bem-vindo, {user.email}</h1>
            <p className="hero-copy">Painel de acompanhamento e cadastro conforme o perfil de acesso.</p>
          </div>

          <div className="hero-badges">
            <span className="pill">{roleLabel}</span>
            <button type="button" className="ghost-button" disabled={loading} onClick={loadDashboardData}>
              Atualizar dados
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <span className="stat-label">Alunos</span>
            <strong>{students.length}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Turmas</span>
            <strong>{classes.length}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Disciplinas</span>
            <strong>{disciplines.length}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Notas</span>
            <strong>{grades.length}</strong>
          </article>
        </div>

        {error ? <p className="feedback-error">{error}</p> : null}
        {success ? <p className="feedback-success">{success}</p> : null}
      </section>

      {loading ? (
        <section className="empty-card">
          <h3>Carregando painel</h3>
          <p>Estamos preparando suas informacoes.</p>
        </section>
      ) : null}

      {!loading && user.role === 'aluno' ? (
        <>
          <section className="page-section">
            <div className="section-header">
              <div>
                <p className="section-kicker">Meu cadastro</p>
                <h2 className="section-title">Perfil do aluno</h2>
              </div>
              <span className="pill">{studentProfile ? 'Vinculado' : 'Pendente'}</span>
            </div>

            {studentProfile ? (
              <div className="profile-grid">
                <article className="data-card">
                  <span className="metric-label">Nome</span>
                  <strong className="metric-value">{studentProfile.name}</strong>
                </article>
                <article className="data-card">
                  <span className="metric-label">Matricula</span>
                  <strong className="metric-value">{studentProfile.registration}</strong>
                </article>
                <article className="data-card">
                  <span className="metric-label">CPF</span>
                  <strong className="metric-value">{studentProfile.cpf || 'Nao informado'}</strong>
                </article>
                <article className="data-card">
                  <span className="metric-label">Telefone</span>
                  <strong className="metric-value">{studentProfile.phone || 'Nao informado'}</strong>
                </article>
              </div>
            ) : (
              <div className="empty-card">
                <h3>Seu perfil ainda nao foi concluido</h3>
                <p>Fale com a administracao para vincular sua conta ao cadastro escolar.</p>
              </div>
            )}
          </section>

          <section className="page-section">
            <div className="section-header">
              <div>
                <p className="section-kicker">Minhas turmas</p>
                <h2 className="section-title">Matriculas ativas</h2>
              </div>
              <span className="pill">{myEnrollments.length} matriculas</span>
            </div>

            <div className="classes-grid">
              {myEnrollments.map((enrollment) => (
                <article key={enrollment.id} className="surface-card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">{enrollment.Class?.name}</h3>
                      <p className="card-copy">{enrollment.Class?.description || 'Sem descricao'}</p>
                    </div>
                    <span className="pill">{enrollment.status}</span>
                  </div>
                  <p className="meta-copy">Sala: {enrollment.Class?.room || 'Nao definida'}</p>
                  <p className="meta-copy">Horario: {enrollment.Class?.schedule || 'Nao definido'}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="page-section">
            <div className="section-header">
              <div>
                <p className="section-kicker">Notas</p>
                <h2 className="section-title">Historico por disciplina</h2>
              </div>
              <span className="pill">{myGrades.length} lancamentos</span>
            </div>

            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Disciplina</th>
                    <th>Turma</th>
                    <th>Nota</th>
                    <th>Semestre</th>
                  </tr>
                </thead>
                <tbody>
                  {myGrades.map((grade) => (
                    <tr key={grade.id}>
                      <td>{grade.Discipline?.name}</td>
                      <td>{grade.Discipline?.Class?.name}</td>
                      <td>{grade.score}</td>
                      <td>{grade.semester}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {!loading && user.role === 'professor' ? (
        <>
          <section className="page-section">
            <div className="section-header">
              <div>
                <p className="section-kicker">Minhas turmas</p>
                <h2 className="section-title">Turmas sob sua responsabilidade</h2>
              </div>
              <span className="pill">{professorClasses.length} turmas</span>
            </div>

            <div className="classes-grid">
              {professorClasses.map((classe) => (
                <article key={classe.id} className="surface-card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">{classe.name}</h3>
                      <p className="card-copy">{classe.description || 'Sem descricao'}</p>
                    </div>
                    <span className="pill">Sala {classe.room || '--'}</span>
                  </div>
                  <p className="meta-copy">Horario: {classe.schedule || 'Nao definido'}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="page-section">
            <div className="section-header">
              <div>
                <p className="section-kicker">Alunos</p>
                <h2 className="section-title">Gerenciar alunos</h2>
              </div>
              <span className="pill">{filteredStudents.length} alunos</span>
            </div>

            <div className="filter-bar">
              <label className="filter-field">
                Buscar por nome
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder="Digite o nome do aluno"
                />
              </label>
            </div>

            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Matricula</th>
                    <th>Email</th>
                    <th>Telefone</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.registration}</td>
                      <td>{student.User?.email}</td>
                      <td>{student.phone || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card-grid">
            <article className="surface-card">
              <div>
                <p className="section-kicker">Lancar nota</p>
                <h2 className="section-title">Registrar avaliacao por disciplina</h2>
              </div>
              <form className="record-form" onSubmit={handleGradeCreate}>
                <label>
                  Aluno
                  <select
                    value={gradeForm.studentId}
                    onChange={(event) =>
                      setGradeForm((current) => ({ ...current, studentId: event.target.value }))
                    }
                    required
                  >
                    <option value="">Selecione</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Disciplina
                  <select
                    value={gradeForm.disciplineId}
                    onChange={(event) =>
                      setGradeForm((current) => ({ ...current, disciplineId: event.target.value }))
                    }
                    required
                  >
                    <option value="">Selecione</option>
                    {professorDisciplines.map((discipline) => (
                      <option key={discipline.id} value={discipline.id}>
                        {disciplineLabel(discipline)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Nota
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={gradeForm.score}
                    onChange={(event) =>
                      setGradeForm((current) => ({ ...current, score: event.target.value }))
                    }
                    required
                  />
                </label>

                <label>
                  Semestre
                  <input
                    type="number"
                    min="1"
                    value={gradeForm.semester}
                    onChange={(event) =>
                      setGradeForm((current) => ({ ...current, semester: event.target.value }))
                    }
                  />
                </label>

                <button type="submit" className="action-button" disabled={submitting}>
                  Lancar nota
                </button>
              </form>
            </article>
          </section>

          <section className="page-section">
            <div className="section-header">
              <div>
                <p className="section-kicker">Notas</p>
                <h2 className="section-title">Lancamentos realizados</h2>
              </div>
              <span className="pill">{filteredProfessorGrades.length} registros</span>
            </div>

            <div className="filter-bar">
              <label className="filter-field">
                Buscar por nome
                <input
                  type="text"
                  value={professorGradeSearch}
                  onChange={(event) => setProfessorGradeSearch(event.target.value)}
                  placeholder="Digite o nome do aluno"
                />
              </label>
            </div>

            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Disciplina</th>
                    <th>Turma</th>
                    <th>Nota</th>
                    <th>Semestre</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfessorGrades.map((grade) => (
                    <tr key={grade.id}>
                      <td>{grade.Student?.name}</td>
                      <td>{grade.Discipline?.name}</td>
                      <td>{grade.Discipline?.Class?.name}</td>
                      <td>{grade.score}</td>
                      <td>{grade.semester}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {!loading && user.role === 'admin' ? (
        <>
          <section className="page-section">
            <div className="section-header">
              <div>
                <p className="section-kicker">Administracao</p>
                <h2 className="section-title">Selecionar modulo</h2>
              </div>
              <div className="segment-control">
                <button
                  type="button"
                  className={adminSection === 'users' ? 'segment-button active' : 'segment-button'}
                  onClick={() => setAdminSection('users')}
                >
                  Usuarios
                </button>
                <button
                  type="button"
                  className={adminSection === 'school' ? 'segment-button active' : 'segment-button'}
                  onClick={() => setAdminSection('school')}
                >
                  Turmas e disciplinas
                </button>
              </div>
            </div>
          </section>

          {adminSection === 'users' ? (
            <>
              <section className="page-section">
                <div className="section-header">
                  <div>
                    <p className="section-kicker">Usuarios</p>
                    <h2 className="section-title">Selecionar tipo de cadastro</h2>
                  </div>
                  <div className="segment-control">
                    <button
                      type="button"
                      className={
                        adminUsersSection === 'professor'
                          ? 'segment-button active'
                          : 'segment-button'
                      }
                      onClick={() => setAdminUsersSection('professor')}
                    >
                      Professor
                    </button>
                    <button
                      type="button"
                      className={
                        adminUsersSection === 'student'
                          ? 'segment-button active'
                          : 'segment-button'
                      }
                      onClick={() => setAdminUsersSection('student')}
                    >
                      Aluno
                    </button>
                    <button
                      type="button"
                      className={
                        adminUsersSection === 'manage' ? 'segment-button active' : 'segment-button'
                      }
                      onClick={() => setAdminUsersSection('manage')}
                    >
                      Gerenciar
                    </button>
                  </div>
                </div>
              </section>

              {adminUsersSection === 'professor' ? (
                <section className="card-grid">
                  <article className="surface-card">
                    <div>
                      <p className="section-kicker">Usuarios</p>
                      <h2 className="section-title">Cadastrar professor</h2>
                    </div>
                    <form className="record-form" onSubmit={handleProfessorCreate}>
                      <label className="full-span">
                        Email do professor
                        <input
                          type="email"
                          value={professorForm.email}
                          onChange={(event) =>
                            setProfessorForm((current) => ({ ...current, email: event.target.value }))
                          }
                          required
                        />
                      </label>

                      <label className="full-span">
                        Senha inicial
                        <input
                          type="password"
                          minLength="6"
                          value={professorForm.password}
                          onChange={(event) =>
                            setProfessorForm((current) => ({
                              ...current,
                              password: event.target.value,
                            }))
                          }
                          required
                        />
                      </label>

                      <button type="submit" className="action-button" disabled={submitting}>
                        Cadastrar professor
                      </button>
                    </form>
                  </article>
                </section>
              ) : null}

              {adminUsersSection === 'student' ? (
                <section className="card-grid">
                  <article className="surface-card">
                    <div>
                      <p className="section-kicker">Usuarios</p>
                      <h2 className="section-title">Cadastrar aluno</h2>
                    </div>
                    <form className="record-form" onSubmit={handleStudentCreate}>
                      <label>
                        Email
                        <input
                          type="email"
                          value={studentForm.email}
                          onChange={(event) =>
                            setStudentForm((current) => ({ ...current, email: event.target.value }))
                          }
                          required
                        />
                      </label>
                      <label>
                        Senha inicial
                        <input
                          type="password"
                          minLength="6"
                          value={studentForm.password}
                          onChange={(event) =>
                            setStudentForm((current) => ({
                              ...current,
                              password: event.target.value,
                            }))
                          }
                          required
                        />
                      </label>
                      <label>
                        Nome
                        <input
                          type="text"
                          value={studentForm.name}
                          onChange={(event) =>
                            setStudentForm((current) => ({ ...current, name: event.target.value }))
                          }
                          required
                        />
                      </label>
                      <label>
                        Matricula
                        <input
                          type="text"
                          value={studentForm.registration}
                          onChange={(event) =>
                            setStudentForm((current) => ({
                              ...current,
                              registration: event.target.value,
                            }))
                          }
                          required
                        />
                      </label>
                      <label>
                        CPF
                        <input
                          type="text"
                          value={studentForm.cpf}
                          onChange={(event) =>
                            setStudentForm((current) => ({ ...current, cpf: event.target.value }))
                          }
                        />
                      </label>
                      <label>
                        Telefone
                        <input
                          type="text"
                          value={studentForm.phone}
                          onChange={(event) =>
                            setStudentForm((current) => ({ ...current, phone: event.target.value }))
                          }
                        />
                      </label>
                      <label className="full-span">
                        Endereco
                        <input
                          type="text"
                          value={studentForm.address}
                          onChange={(event) =>
                            setStudentForm((current) => ({
                              ...current,
                              address: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <button type="submit" className="action-button" disabled={submitting}>
                        Cadastrar aluno
                      </button>
                    </form>
                  </article>
                </section>
              ) : null}

              {adminUsersSection === 'manage' ? (
                <>
                  <section className="page-section">
                    <div className="section-header">
                      <div>
                        <p className="section-kicker">Usuarios</p>
                        <h2 className="section-title">Gerenciar usuarios</h2>
                      </div>
                      <span className="pill">{filteredUsers.length} usuarios</span>
                    </div>

                    <div className="filter-bar">
                      <label className="filter-field">
                        Buscar por nome
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(event) => setUserSearch(event.target.value)}
                          placeholder="Digite o email"
                        />
                      </label>
                    </div>

                    <div className="table-shell">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Email</th>
                            <th>Papel</th>
                            <th>Acoes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((item) => (
                            <tr key={item.id}>
                              <td>{item.email}</td>
                              <td>{item.role}</td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    type="button"
                                    className="ghost-button"
                                    onClick={() => {
                                      setEditingUserId(item.id)
                                      setEditingUserForm({
                                        email: item.email,
                                        role: item.role,
                                        password: '',
                                      })
                                    }}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    className="ghost-button"
                                    disabled={submitting}
                                    onClick={() => handleDeleteUser(item)}
                                  >
                                    Remover
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {editingUserId ? (
                    <section className="card-grid">
                      <article className="surface-card">
                        <div>
                          <p className="section-kicker">Usuarios</p>
                          <h2 className="section-title">Editar usuario</h2>
                        </div>
                        <form className="record-form" onSubmit={handleUserUpdate}>
                          <label>
                            Email
                            <input
                              type="email"
                              value={editingUserForm.email}
                              onChange={(event) =>
                                setEditingUserForm((current) => ({
                                  ...current,
                                  email: event.target.value,
                                }))
                              }
                              required
                            />
                          </label>
                          <label>
                            Papel
                            <select
                              value={editingUserForm.role}
                              onChange={(event) =>
                                setEditingUserForm((current) => ({
                                  ...current,
                                  role: event.target.value,
                                }))
                              }
                            >
                              <option value="admin">admin</option>
                              <option value="professor">professor</option>
                              <option value="aluno">aluno</option>
                            </select>
                          </label>
                          <label className="full-span">
                            Nova senha
                            <input
                              type="password"
                              value={editingUserForm.password}
                              onChange={(event) =>
                                setEditingUserForm((current) => ({
                                  ...current,
                                  password: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <div className="button-row full-span">
                            <button type="submit" className="action-button" disabled={submitting}>
                              Salvar
                            </button>
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() => {
                                setEditingUserId(null)
                                setEditingUserForm(initialUserEditForm)
                              }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      </article>
                    </section>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}

          {adminSection === 'school' ? (
            <>
              <section className="page-section">
                <div className="section-header">
                  <div>
                    <p className="section-kicker">Turmas e disciplinas</p>
                    <h2 className="section-title">Selecionar area</h2>
                  </div>
                  <div className="segment-control">
                    <button
                      type="button"
                      className={
                        adminSchoolSection === 'classes'
                          ? 'segment-button active'
                          : 'segment-button'
                      }
                      onClick={() => setAdminSchoolSection('classes')}
                    >
                      Turmas
                    </button>
                    <button
                      type="button"
                      className={
                        adminSchoolSection === 'disciplines'
                          ? 'segment-button active'
                          : 'segment-button'
                      }
                      onClick={() => setAdminSchoolSection('disciplines')}
                    >
                      Disciplinas
                    </button>
                    <button
                      type="button"
                      className={
                        adminSchoolSection === 'enrollments'
                          ? 'segment-button active'
                          : 'segment-button'
                      }
                      onClick={() => setAdminSchoolSection('enrollments')}
                    >
                      Matriculas
                    </button>
                  </div>
                </div>
              </section>

              {adminSchoolSection === 'classes' ? (
                <>
                  <section className="card-grid">
                    <article className="surface-card">
                      <div>
                        <p className="section-kicker">Turmas</p>
                        <h2 className="section-title">
                          {editingClassId ? 'Editar turma' : 'Cadastrar turma'}
                        </h2>
                      </div>
                      <form className="record-form" onSubmit={handleClassSubmit}>
                        <label>
                          Nome da turma
                          <input
                            type="text"
                            value={classForm.name}
                            onChange={(event) =>
                              setClassForm((current) => ({ ...current, name: event.target.value }))
                            }
                            required
                          />
                        </label>
                        <label>
                          Horario
                          <input
                            type="text"
                            value={classForm.schedule}
                            onChange={(event) =>
                              setClassForm((current) => ({
                                ...current,
                                schedule: event.target.value,
                              }))
                            }
                          />
                        </label>
                        <label>
                          Sala
                          <input
                            type="text"
                            value={classForm.room}
                            onChange={(event) =>
                              setClassForm((current) => ({ ...current, room: event.target.value }))
                            }
                          />
                        </label>
                        <label>
                          Professor
                          <select
                            value={classForm.professorId}
                            onChange={(event) =>
                              setClassForm((current) => ({
                                ...current,
                                professorId: event.target.value,
                              }))
                            }
                          >
                            <option value="">Sem professor</option>
                            {professors.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.email}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="full-span">
                          Descricao
                          <textarea
                            value={classForm.description}
                            onChange={(event) =>
                              setClassForm((current) => ({
                                ...current,
                                description: event.target.value,
                              }))
                            }
                          />
                        </label>
                        <div className="button-row full-span">
                          <button type="submit" className="action-button" disabled={submitting}>
                            {editingClassId ? 'Salvar turma' : 'Cadastrar turma'}
                          </button>
                          {editingClassId ? (
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() => {
                                setEditingClassId(null)
                                setClassForm(initialClassForm)
                              }}
                            >
                              Cancelar
                            </button>
                          ) : null}
                        </div>
                      </form>
                    </article>
                  </section>

                  <section className="page-section">
                    <div className="section-header">
                      <div>
                        <p className="section-kicker">Turmas</p>
                        <h2 className="section-title">Gerenciar turmas</h2>
                      </div>
                      <span className="pill">{filteredClasses.length} turmas</span>
                    </div>

                    <div className="filter-bar">
                      <label className="filter-field">
                        Buscar por nome
                        <input
                          type="text"
                          value={classSearch}
                          onChange={(event) => setClassSearch(event.target.value)}
                          placeholder="Digite a turma ou professor"
                        />
                      </label>
                    </div>

                    <div className="table-shell">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Turma</th>
                            <th>Professor</th>
                            <th>Sala</th>
                            <th>Acoes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredClasses.map((classe) => (
                            <tr key={classe.id}>
                              <td>{classe.name}</td>
                              <td>{classe.User?.email || 'Nao atribuido'}</td>
                              <td>{classe.room || '--'}</td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    type="button"
                                    className="ghost-button"
                                    onClick={() => {
                                      setEditingClassId(classe.id)
                                      setClassForm({
                                        name: classe.name,
                                        description: classe.description || '',
                                        schedule: classe.schedule || '',
                                        room: classe.room || '',
                                        professorId: classe.professorId || '',
                                      })
                                    }}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    className="ghost-button"
                                    disabled={submitting}
                                    onClick={() => handleDeleteClass(classe)}
                                  >
                                    Remover
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              ) : null}

              {adminSchoolSection === 'disciplines' ? (
                <>
                  <section className="card-grid">
                    <article className="surface-card">
                      <div>
                        <p className="section-kicker">Disciplinas</p>
                        <h2 className="section-title">
                          {editingDisciplineId ? 'Editar disciplina' : 'Cadastrar disciplina'}
                        </h2>
                      </div>
                      <form className="record-form" onSubmit={handleDisciplineSubmit}>
                        <label>
                          Nome da disciplina
                          <input
                            type="text"
                            value={disciplineForm.name}
                            onChange={(event) =>
                              setDisciplineForm((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                            required
                          />
                        </label>
                        <label>
                          Turma
                          <select
                            value={disciplineForm.classId}
                            onChange={(event) =>
                              setDisciplineForm((current) => ({
                                ...current,
                                classId: event.target.value,
                              }))
                            }
                            required
                          >
                            <option value="">Selecione</option>
                            {classes.map((classe) => (
                              <option key={classe.id} value={classe.id}>
                                {classe.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="full-span">
                          Descricao
                          <textarea
                            value={disciplineForm.description}
                            onChange={(event) =>
                              setDisciplineForm((current) => ({
                                ...current,
                                description: event.target.value,
                              }))
                            }
                          />
                        </label>
                        <div className="button-row full-span">
                          <button type="submit" className="action-button" disabled={submitting}>
                            {editingDisciplineId ? 'Salvar disciplina' : 'Cadastrar disciplina'}
                          </button>
                          {editingDisciplineId ? (
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() => {
                                setEditingDisciplineId(null)
                                setDisciplineForm(initialDisciplineForm)
                              }}
                            >
                              Cancelar
                            </button>
                          ) : null}
                        </div>
                      </form>
                    </article>
                  </section>

                  <section className="page-section">
                    <div className="section-header">
                      <div>
                        <p className="section-kicker">Disciplinas</p>
                        <h2 className="section-title">Gerenciar disciplinas</h2>
                      </div>
                      <span className="pill">{filteredDisciplines.length} disciplinas</span>
                    </div>

                    <div className="filter-bar">
                      <label className="filter-field">
                        Buscar por nome
                        <input
                          type="text"
                          value={disciplineSearch}
                          onChange={(event) => setDisciplineSearch(event.target.value)}
                          placeholder="Digite a disciplina ou turma"
                        />
                      </label>
                    </div>

                    <div className="table-shell">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Disciplina</th>
                            <th>Turma</th>
                            <th>Acoes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDisciplines.map((discipline) => (
                            <tr key={discipline.id}>
                              <td>{discipline.name}</td>
                              <td>{discipline.Class?.name}</td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    type="button"
                                    className="ghost-button"
                                    onClick={() => {
                                      setEditingDisciplineId(discipline.id)
                                      setDisciplineForm({
                                        name: discipline.name,
                                        description: discipline.description || '',
                                        classId: discipline.classId,
                                      })
                                    }}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    className="ghost-button"
                                    disabled={submitting}
                                    onClick={() => handleDeleteDiscipline(discipline)}
                                  >
                                    Remover
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              ) : null}

              {adminSchoolSection === 'enrollments' ? (
                <>
                  <section className="card-grid">
                    <article className="surface-card">
                      <div>
                        <p className="section-kicker">Matriculas</p>
                        <h2 className="section-title">Matricular aluno em turma</h2>
                      </div>
                      <form className="record-form" onSubmit={handleEnrollmentCreate}>
                        <label>
                          Aluno
                          <select
                            value={enrollmentForm.studentId}
                            onChange={(event) =>
                              setEnrollmentForm((current) => ({
                                ...current,
                                studentId: event.target.value,
                              }))
                            }
                            required
                          >
                            <option value="">Selecione</option>
                            {students.map((student) => (
                              <option key={student.id} value={student.id}>
                                {student.name} ({student.registration})
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Turma
                          <select
                            value={enrollmentForm.classId}
                            onChange={(event) =>
                              setEnrollmentForm((current) => ({
                                ...current,
                                classId: event.target.value,
                              }))
                            }
                            required
                          >
                            <option value="">Selecione</option>
                            {classes.map((classe) => (
                              <option key={classe.id} value={classe.id}>
                                {classe.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Status
                          <select
                            value={enrollmentForm.status}
                            onChange={(event) =>
                              setEnrollmentForm((current) => ({
                                ...current,
                                status: event.target.value,
                              }))
                            }
                          >
                            <option value="active">Ativa</option>
                            <option value="completed">Concluida</option>
                            <option value="dropped">Trancada</option>
                          </select>
                        </label>
                        <button type="submit" className="action-button" disabled={submitting}>
                          Cadastrar matricula
                        </button>
                      </form>
                    </article>
                  </section>

                  <section className="page-section">
                    <div className="section-header">
                      <div>
                        <p className="section-kicker">Matriculas</p>
                        <h2 className="section-title">Listagem com filtros</h2>
                      </div>
                      <span className="pill">{filteredEnrollments.length} registros</span>
                    </div>

                    <div className="filter-grid">
                      <label className="filter-field">
                        Buscar por nome
                        <input
                          type="text"
                          value={enrollmentSearch}
                          onChange={(event) => setEnrollmentSearch(event.target.value)}
                          placeholder="Digite o nome do aluno"
                        />
                      </label>
                      <label className="filter-field">
                        Status
                        <select
                          value={enrollmentStatus}
                          onChange={(event) => setEnrollmentStatus(event.target.value)}
                        >
                          <option value="all">Todos</option>
                          <option value="active">Ativa</option>
                          <option value="completed">Concluida</option>
                          <option value="dropped">Trancada</option>
                        </select>
                      </label>
                    </div>

                    <div className="table-shell">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Aluno</th>
                            <th>Turma</th>
                            <th>Status</th>
                            <th>Acoes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEnrollments.map((enrollment) => (
                            <tr key={enrollment.id}>
                              <td>{enrollment.Student?.name}</td>
                              <td>{enrollment.Class?.name}</td>
                              <td>{enrollment.status}</td>
                              <td>
                                <div className="table-actions">
                                  <select
                                    value={enrollment.status}
                                    onChange={(event) =>
                                      handleEnrollmentStatusChange(enrollment.id, event.target.value)
                                    }
                                  >
                                    <option value="active">Ativa</option>
                                    <option value="completed">Concluida</option>
                                    <option value="dropped">Trancada</option>
                                  </select>
                                  <button
                                    type="button"
                                    className="ghost-button"
                                    disabled={submitting}
                                    onClick={() => handleDeleteEnrollment(enrollment.id)}
                                  >
                                    Remover
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              ) : null}
            </>
          ) : null}
        </>
      ) : null}

      {!loading && (user.role === 'admin' || user.role === 'professor') ? (
        <section className="page-section">
          <div className="section-header">
            <div>
              <p className="section-kicker">Alunos</p>
              <h2 className="section-title">Listagem com busca por nome</h2>
            </div>
            <span className="pill">{filteredStudents.length} alunos</span>
          </div>

          <div className="filter-bar">
            <label className="filter-field">
              Buscar por nome
              <input
                type="text"
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
                placeholder="Digite o nome do aluno"
              />
            </label>
          </div>

          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Matricula</th>
                  <th>Email</th>
                  <th>ID do aluno</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.registration}</td>
                    <td>{student.User?.email}</td>
                    <td>{student.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!loading && (user.role === 'admin' || user.role === 'professor') ? (
        <section className="page-section">
          <div className="section-header">
            <div>
              <p className="section-kicker">Notas cadastradas</p>
              <h2 className="section-title">Listagem com filtros</h2>
            </div>
            <span className="pill">
              {user.role === 'admin' ? filteredAdminGrades.length : filteredProfessorGrades.length}{' '}
              registros
            </span>
          </div>

          {user.role === 'admin' ? (
            <div className="filter-grid">
              <label className="filter-field">
                Buscar por nome
                <input
                  type="text"
                  value={gradeSearch}
                  onChange={(event) => setGradeSearch(event.target.value)}
                  placeholder="Digite o nome do aluno"
                />
              </label>
              <label className="filter-field">
                Disciplina
                <select
                  value={gradeDisciplineFilter}
                  onChange={(event) => setGradeDisciplineFilter(event.target.value)}
                >
                  <option value="all">Todas</option>
                  {disciplines.map((discipline) => (
                    <option key={discipline.id} value={discipline.id}>
                      {disciplineLabel(discipline)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Disciplina</th>
                  <th>Turma</th>
                  <th>Nota</th>
                  <th>Semestre</th>
                  {user.role === 'admin' ? <th>Acoes</th> : null}
                </tr>
              </thead>
              <tbody>
                {(user.role === 'admin' ? filteredAdminGrades : filteredProfessorGrades).map(
                  (grade) => (
                    <tr key={grade.id}>
                      <td>{grade.Student?.name}</td>
                      <td>{grade.Discipline?.name}</td>
                      <td>{grade.Discipline?.Class?.name}</td>
                      <td>{grade.score}</td>
                      <td>{grade.semester}</td>
                      {user.role === 'admin' ? (
                        <td>
                          <button
                            type="button"
                            className="ghost-button"
                            disabled={submitting}
                            onClick={() => handleDeleteGrade(grade.id)}
                          >
                            Remover
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}
