import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const initialForm = {
  email: '',
  password: '',
}

export default function Login() {
  const { user, login } = useAuth()
  const location = useLocation()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user) {
    return <Navigate to={location.state?.from || '/dashboard'} replace />
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')
      await login(form.email, form.password)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-card">
        <div>
          <p className="section-kicker">Acesso</p>
          <h1 className="section-title">Entrar no portal escolar</h1>
          <p className="hero-copy">
            Use seu email e sua senha para acessar suas turmas, matriculas e atividades.
          </p>
        </div>

        <form className="record-form" onSubmit={handleSubmit}>
          <label className="full-span">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="full-span">
            Senha
            <input
              type="password"
              name="password"
              minLength="6"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="action-button full-span" disabled={loading}>
            {loading ? 'Aguarde...' : 'Entrar'}
          </button>
        </form>

        {error ? <p className="feedback-error">{error}</p> : null}

        <p className="meta-copy">
          Se voce ainda nao recebeu acesso, fale com a administracao da escola.
        </p>
      </section>
    </div>
  )
}
