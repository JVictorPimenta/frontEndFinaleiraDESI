import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="page-stack">
      <section className="hero-panel hero-layout">
        <div>
          <p className="eyebrow">finaleiraDESI</p>
          <h1 className="hero-title">Sistema escolar</h1>
          <p className="hero-copy">
            Consulte turmas, matriculas e notas de acordo com o perfil de acesso da sua conta.
          </p>

          <div className="hero-actions">
            <Link to={user ? '/dashboard' : '/login'} className="cta-primary">
              {user ? 'Abrir dashboard' : 'Entrar no sistema'}
            </Link>
            <Link to="/login" className="cta-secondary">
              Ver minha area
            </Link>
          </div>
        </div>

        <div className="surface-card">
          <div>
            <p className="section-kicker">Perfis de acesso</p>
            <h2 className="section-title">Funcionalidades por tipo de usuario</h2>
          </div>
          <ul className="bullet-list">
            <li>Alunos acompanham cadastro, turmas e notas.</li>
            <li>Professores organizam turmas e matriculam alunos.</li>
            <li>A administracao monta a estrutura da escola e gerencia acessos.</li>
          </ul>
        </div>
      </section>

      <section className="home-grid">
        <article className="page-section">
          <p className="section-kicker">Acesso</p>
          <h2 className="section-title">Fluxo de uso</h2>
          <ul className="info-list">
            <li>1. A administracao libera o acesso de cada pessoa.</li>
            <li>2. As turmas sao organizadas e vinculadas aos professores.</li>
            <li>3. Cada usuario entra e acompanha o que precisa no proprio painel.</li>
          </ul>
        </article>

        <article className="page-section">
          <p className="section-kicker">Informacoes</p>
          <h2 className="section-title">Areas disponiveis</h2>
          <p className="list-copy">
            O painel apresenta as opcoes de consulta e cadastro conforme o papel definido
            para cada conta.
          </p>
        </article>
      </section>
    </div>
  )
}
