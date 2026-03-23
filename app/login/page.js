'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function entrar(e) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>PERFIL 4D</h1>
        <p style={styles.sub}>Área do Psicanalista</p>
        <form onSubmit={entrar}>
          <div style={styles.grupo}>
            <label style={styles.label}>E-mail</label>
            <input style={styles.input} type="email" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={styles.grupo}>
            <label style={styles.label}>Senha</label>
            <input style={styles.input} type="password" value={senha}
              onChange={e => setSenha(e.target.value)} required />
          </div>
          {erro && <p style={styles.erro}>{erro}</p>}
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar →'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight:'100vh', background:'#0D1B3E', display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { background:'#fff', borderRadius:12, padding:'40px 36px', width:'100%', maxWidth:380 },
  titulo: { fontFamily:'Georgia,serif', color:'#0D1B3E', fontSize:32, letterSpacing:3, textAlign:'center', marginBottom:4 },
  sub: { color:'#9A7A2E', fontSize:14, textAlign:'center', marginBottom:32 },
  grupo: { marginBottom:18 },
  label: { display:'block', fontSize:13, fontWeight:'bold', color:'#333', marginBottom:6 },
  input: { width:'100%', padding:'11px 14px', border:'1px solid #e0d8cc', borderRadius:8, fontSize:15, outline:'none' },
  btn: { width:'100%', padding:'14px', background:'#0D1B3E', color:'#C9A84C', border:'none', borderRadius:8, fontSize:16, fontWeight:'bold', cursor:'pointer', marginTop:8 },
  erro: { color:'#C62828', fontSize:14, marginTop:8 },
}
