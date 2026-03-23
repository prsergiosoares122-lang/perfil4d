'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PERGUNTAS, BLOCOS, NOMES } from '../../lib/perguntas'
import { supabase } from '../../lib/supabase'

const TODOS = [...BLOCOS.bloco1, ...BLOCOS.bloco2]

export default function Questionario() {
  const router = useRouter()
  const [etapa, setEtapa] = useState('identificacao') // identificacao | perguntas | obrigado
  const [conjuge, setConjuge] = useState('')
  const [casalId, setCasalId] = useState('')
  const [nomeEsposo, setNomeEsposo] = useState('')
  const [nomeEsposa, setNomeEsposa] = useState('')
  const [email, setEmail] = useState('')
  const [respostas, setRespostas] = useState({})
  const [blocoAtual, setBlocoAtual] = useState(0)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const comportamentoAtual = TODOS[blocoAtual]
  const perguntasAtuais = PERGUNTAS[comportamentoAtual] || []
  const totalBlocos = TODOS.length
  const progresso = Math.round((blocoAtual / totalBlocos) * 100)

  async function iniciar(e) {
    e.preventDefault()
    if (!nomeEsposo || !nomeEsposa || !conjuge) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }
    setLoading(true)
    setErro('')
    try {
      const { data, error } = await supabase
        .from('casais')
        .insert({ nome_esposo: nomeEsposo, nome_esposa: nomeEsposa, email_contato: email })
        .select()
        .single()
      if (error) throw error
      setCasalId(data.id)
      setEtapa('perguntas')
    } catch (err) {
      setErro('Erro ao iniciar. Tente novamente.')
    }
    setLoading(false)
  }

  function responder(perguntaIdx, valor) {
    setRespostas(prev => ({
      ...prev,
      [`${comportamentoAtual}_${perguntaIdx + 1}`]: valor
    }))
  }

  function blocoCompleto() {
    return perguntasAtuais.every((_, i) => respostas[`${comportamentoAtual}_${i + 1}`])
  }

  function avancar() {
    if (!blocoCompleto()) {
      setErro('Responda todas as perguntas antes de continuar.')
      return
    }
    setErro('')
    if (blocoAtual < totalBlocos - 1) {
      setBlocoAtual(b => b + 1)
      window.scrollTo(0, 0)
    } else {
      enviarRespostas()
    }
  }

  async function enviarRespostas() {
    setLoading(true)
    try {
      const { error } = await supabase.from('respostas').insert({
        casal_id: casalId,
        conjuge,
        ...respostas
      })
      if (error) throw error

      // Atualizar status do casal
      const statusAtual = conjuge === 'esposo' ? 'esposo_respondeu' : 'esposa_respondeu'
      await supabase.from('casais').update({ status: statusAtual }).eq('id', casalId)

      setEtapa('obrigado')
    } catch (err) {
      setErro('Erro ao enviar respostas. Tente novamente.')
    }
    setLoading(false)
  }

  if (etapa === 'obrigado') return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{textAlign:'center',padding:'40px 20px'}}>
          <div style={{fontSize:60,marginBottom:20}}>✓</div>
          <h1 style={{fontFamily:'Georgia,serif',color:'#0D1B3E',fontSize:28,marginBottom:16}}>Questionário enviado!</h1>
          <p style={{color:'#555',lineHeight:1.8,marginBottom:8}}>Suas respostas foram recebidas com sucesso.</p>
          <p style={{color:'#555',lineHeight:1.8,marginBottom:24}}>O Psicanalista Sérgio Soares irá processar sua análise e em breve você receberá seu relatório personalizado pelo WhatsApp.</p>
          <p style={{color:'#9A7A2E',fontStyle:'italic',fontSize:15}}>Aguarde — seu Perfil 4D está sendo preparado com cuidado.</p>
        </div>
      </div>
    </div>
  )

  if (etapa === 'identificacao') return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.titulo}>PERFIL 4D</h1>
        <p style={styles.subtitulo}>Análise Comportamental para Casais</p>
      </div>
      <div style={styles.card}>
        <div style={styles.aviso}>
          <strong>Antes de começar:</strong> Este formulário deve ser respondido apenas uma vez. Cada cônjuge responde individualmente, sem mostrar as respostas ao outro. Leva cerca de 10 minutos.
        </div>
        <form onSubmit={iniciar}>
          <div style={styles.grupo}>
            <label style={styles.label}>Você é o(a): *</label>
            <div style={{display:'flex',gap:12}}>
              {['esposo','esposa'].map(op => (
                <button key={op} type="button"
                  onClick={() => setConjuge(op)}
                  style={{...styles.btnOpcao, ...(conjuge===op ? styles.btnOpcaoAtivo : {})}}>
                  {op === 'esposo' ? 'Esposo' : 'Esposa'}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.grupo}>
            <label style={styles.label}>Nome do esposo: *</label>
            <input style={styles.input} value={nomeEsposo} onChange={e => setNomeEsposo(e.target.value)} placeholder="Nome completo do esposo" required />
          </div>
          <div style={styles.grupo}>
            <label style={styles.label}>Nome da esposa: *</label>
            <input style={styles.input} value={nomeEsposa} onChange={e => setNomeEsposa(e.target.value)} placeholder="Nome completo da esposa" required />
          </div>
          <div style={styles.grupo}>
            <label style={styles.label}>E-mail de contato (opcional):</label>
            <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
          {erro && <p style={styles.erro}>{erro}</p>}
          <button type="submit" style={styles.btnPrimario} disabled={loading}>
            {loading ? 'Aguarde...' : 'Começar o questionário →'}
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.titulo}>PERFIL 4D</h1>
        <div style={styles.progressoBar}>
          <div style={{...styles.progressoFill, width:`${progresso}%`}}></div>
        </div>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:13,marginTop:8}}>
          Comportamento {blocoAtual + 1} de {totalBlocos} — {progresso}% concluído
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.blocoTitulo}>
          <span style={styles.blocoTag}>{BLOCOS.bloco1.includes(comportamentoAtual) ? 'Bloco 1' : 'Bloco 2'}</span>
          <h2 style={styles.blocoNome}>{NOMES[comportamentoAtual]}</h2>
        </div>

        <div style={styles.escalaLegenda}>
          <span>1 = Nunca</span><span>2 = Raramente</span><span>3 = Às vezes</span>
          <span>4 = Frequentemente</span><span>5 = Sempre</span>
        </div>

        {perguntasAtuais.map((pergunta, i) => {
          const chave = `${comportamentoAtual}_${i + 1}`
          const valor = respostas[chave]
          return (
            <div key={i} style={styles.perguntaCard}>
              <p style={styles.perguntaTexto}>{i + 1}. {pergunta}</p>
              <div style={styles.opcoes}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button"
                    onClick={() => responder(i, n)}
                    style={{...styles.btnNumero, ...(valor===n ? styles.btnNumeroAtivo : {})}}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {erro && <p style={styles.erro}>{erro}</p>}

        <div style={{display:'flex',gap:12,marginTop:24}}>
          {blocoAtual > 0 && (
            <button onClick={() => { setBlocoAtual(b=>b-1); setErro('') }}
              style={styles.btnSecundario}>← Anterior</button>
          )}
          <button onClick={avancar} style={styles.btnPrimario} disabled={loading}>
            {loading ? 'Enviando...' : blocoAtual === totalBlocos - 1 ? 'Enviar respostas ✓' : 'Próximo →'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight:'100vh', background:'#F8F4ED', fontFamily:'Arial,sans-serif' },
  header: { background:'#0D1B3E', padding:'32px 20px', textAlign:'center' },
  titulo: { fontFamily:'Georgia,serif', color:'#C9A84C', fontSize:36, letterSpacing:4, marginBottom:8 },
  subtitulo: { color:'rgba(255,255,255,0.7)', fontSize:15, fontWeight:300 },
  card: { maxWidth:640, margin:'0 auto', background:'#fff', borderRadius:12, padding:'32px 28px', marginTop:24, marginBottom:24, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' },
  aviso: { background:'#FFF8E1', borderLeft:'4px solid #C9A84C', padding:'16px 20px', borderRadius:'0 8px 8px 0', fontSize:14, color:'#4a3800', lineHeight:1.7, marginBottom:24 },
  grupo: { marginBottom:20 },
  label: { display:'block', fontSize:14, fontWeight:'bold', color:'#0D1B3E', marginBottom:8 },
  input: { width:'100%', padding:'12px 14px', border:'1px solid #e0d8cc', borderRadius:8, fontSize:15, outline:'none' },
  btnOpcao: { flex:1, padding:'12px', border:'2px solid #e0d8cc', borderRadius:8, fontSize:15, cursor:'pointer', background:'#fff', color:'#555', transition:'all .2s' },
  btnOpcaoAtivo: { borderColor:'#0D1B3E', background:'#0D1B3E', color:'#C9A84C', fontWeight:'bold' },
  btnPrimario: { flex:1, width:'100%', padding:'14px', background:'#0D1B3E', color:'#C9A84C', border:'none', borderRadius:8, fontSize:16, fontWeight:'bold', cursor:'pointer' },
  btnSecundario: { padding:'14px 20px', background:'#fff', color:'#0D1B3E', border:'1px solid #e0d8cc', borderRadius:8, fontSize:15, cursor:'pointer' },
  erro: { color:'#C62828', fontSize:14, marginTop:12, marginBottom:0 },
  progressoBar: { width:'100%', maxWidth:400, height:4, background:'rgba(255,255,255,0.2)', borderRadius:2, margin:'12px auto 0', overflow:'hidden' },
  progressoFill: { height:'100%', background:'#C9A84C', borderRadius:2, transition:'width .3s' },
  blocoTitulo: { marginBottom:20 },
  blocoTag: { fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'#C9A84C', fontWeight:'bold' },
  blocoNome: { fontFamily:'Georgia,serif', fontSize:22, color:'#0D1B3E', marginTop:4 },
  escalaLegenda: { display:'flex', gap:8, flexWrap:'wrap', fontSize:12, color:'#888', marginBottom:20, padding:'10px 14px', background:'#faf7f2', borderRadius:6 },
  perguntaCard: { padding:'16px 0', borderBottom:'1px solid #f0ebe3' },
  perguntaTexto: { fontSize:15, color:'#333', lineHeight:1.7, marginBottom:12 },
  opcoes: { display:'flex', gap:8 },
  btnNumero: { width:44, height:44, border:'2px solid #e0d8cc', borderRadius:8, fontSize:16, fontWeight:'bold', cursor:'pointer', background:'#fff', color:'#555', transition:'all .15s' },
  btnNumeroAtivo: { borderColor:'#0D1B3E', background:'#0D1B3E', color:'#C9A84C' },
}
