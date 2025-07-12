import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Download, FileText, Image, Building2, Zap, Shield, Droplets, Wind, Flame, Car, Accessibility, MessageSquare, Trees } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Estrutura de dados das disciplinas
const disciplinas = [
  { id: 'arquitetura', nome: 'Projeto executivo de Arquitetura', icon: Building2, peso: 15 },
  { id: 'estrutural', nome: 'Projeto executivo Estrutural', icon: Building2, peso: 12 },
  { id: 'eletrica', nome: 'Projeto executivo de Instalações Elétricas e SPDA', icon: Zap, peso: 10 },
  { id: 'eletronicos', nome: 'Projeto executivo de Sistemas Eletrônicos', icon: Shield, peso: 8 },
  { id: 'hidrossanitario', nome: 'Projeto executivo Hidrossanitário e Drenagem', icon: Droplets, peso: 10 },
  { id: 'climatizacao', nome: 'Projeto executivo de Climatização e Exaustão', icon: Wind, peso: 8 },
  { id: 'incendio', nome: 'Projeto executivo de Prevenção e Combate a Incêndio', icon: Flame, peso: 8 },
  { id: 'viaria', nome: 'Projeto executivo de Infraestrutura Viária e Pavimentação', icon: Car, peso: 7 },
  { id: 'acessibilidade', nome: 'Projeto executivo de Acessibilidade', icon: Accessibility, peso: 7 },
  { id: 'comunicacao', nome: 'Projeto executivo de Comunicação Visual', icon: MessageSquare, peso: 8 },
  { id: 'paisagismo', nome: 'Projeto executivo de Paisagismo', icon: Trees, peso: 7 }
]

// Estrutura das etapas
const etapas = [
  { id: 1, nome: 'Etapa 1', peso: 30, cor: '#3b82f6' },
  { id: 2, nome: 'Etapa 2', peso: 40, cor: '#10b981' },
  { id: 3, nome: 'Etapa 3', peso: 30, cor: '#f59e0b' }
]

function App() {
  const [progressoDisciplinas, setProgressoDisciplinas] = useState({})
  const [observacoes, setObservacoes] = useState({})

  // Inicializar com dados da Etapa 1 parcialmente preenchida
  useEffect(() => {
    const progressoInicial = {}
    const observacoesIniciais = {}
    
    disciplinas.forEach(disciplina => {
      progressoInicial[disciplina.id] = {
        etapa1: disciplina.id === 'arquitetura' ? 85 : 
                disciplina.id === 'estrutural' ? 70 :
                disciplina.id === 'eletrica' ? 60 :
                disciplina.id === 'hidrossanitario' ? 45 :
                disciplina.id === 'climatizacao' ? 30 : 0,
        etapa2: 0,
        etapa3: 0
      }
      
      observacoesIniciais[disciplina.id] = disciplina.id === 'arquitetura' ? 
        'Plantas baixas e cortes concluídos. Pendente: detalhamento de esquadrias.' :
        disciplina.id === 'estrutural' ? 
        'Estrutura principal definida. Em andamento: detalhamento das fundações.' :
        disciplina.id === 'eletrica' ?
        'Projeto de força concluído. Pendente: projeto de iluminação.' : ''
    })
    
    setProgressoDisciplinas(progressoInicial)
    setObservacoes(observacoesIniciais)
  }, [])

  // Calcular progresso geral ponderado
  const calcularProgressoGeral = () => {
    let totalPonderado = 0
    let pesoTotal = 0

    disciplinas.forEach(disciplina => {
      const progresso = progressoDisciplinas[disciplina.id] || { etapa1: 0, etapa2: 0, etapa3: 0 }
      
      etapas.forEach(etapa => {
        const progressoEtapa = progresso[`etapa${etapa.id}`] || 0
        const contribuicao = (progressoEtapa / 100) * (etapa.peso / 100) * (disciplina.peso / 100)
        totalPonderado += contribuicao
        pesoTotal += (etapa.peso / 100) * (disciplina.peso / 100)
      })
    })

    return Math.round((totalPonderado / pesoTotal) * 100)
  }

  // Calcular progresso por etapa
  const calcularProgressoEtapa = (etapaId) => {
    let totalPonderado = 0
    let pesoTotal = 0

    disciplinas.forEach(disciplina => {
      const progresso = progressoDisciplinas[disciplina.id] || { etapa1: 0, etapa2: 0, etapa3: 0 }
      const progressoEtapa = progresso[`etapa${etapaId}`] || 0
      
      totalPonderado += (progressoEtapa / 100) * (disciplina.peso / 100)
      pesoTotal += disciplina.peso / 100
    })

    return Math.round((totalPonderado / pesoTotal) * 100)
  }

  // Determinar status da disciplina
  const getStatusDisciplina = (disciplina) => {
    const progresso = progressoDisciplinas[disciplina.id] || { etapa1: 0, etapa2: 0, etapa3: 0 }
    const total = progresso.etapa1 + progresso.etapa2 + progresso.etapa3

    if (total === 0) return { status: 'não iniciado', cor: 'bg-gray-500' }
    if (total >= 100) return { status: 'concluído', cor: 'bg-green-500' }
    return { status: 'em andamento', cor: 'bg-yellow-500' }
  }

  // Atualizar progresso de disciplina
  const atualizarProgresso = (disciplinaId, etapa, valor) => {
    setProgressoDisciplinas(prev => ({
      ...prev,
      [disciplinaId]: {
        ...prev[disciplinaId],
        [`etapa${etapa}`]: Math.min(100, Math.max(0, parseInt(valor) || 0))
      }
    }))
  }

  // Atualizar observações
  const atualizarObservacao = (disciplinaId, texto) => {
    setObservacoes(prev => ({
      ...prev,
      [disciplinaId]: texto
    }))
  }

  // Função de exportação para PDF
  const exportarPDF = () => {
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank')
    const painelContent = document.getElementById('painel-bim').innerHTML
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Painel BIM - Polícia Federal Belém/PA</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #111827; 
              color: white; 
            }
            .max-w-7xl { max-width: 80rem; margin: 0 auto; }
            .mb-8 { margin-bottom: 2rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .p-4 { padding: 1rem; }
            .text-3xl { font-size: 1.875rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-lg { font-size: 1.125rem; }
            .font-bold { font-weight: bold; }
            .text-center { text-align: center; }
            .bg-gray-800 { background-color: #1f2937; }
            .bg-blue-600 { background-color: #2563eb; }
            .rounded-lg { border-radius: 0.5rem; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .space-x-4 > * + * { margin-left: 1rem; }
            .grid { display: grid; }
            .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .gap-6 { gap: 1.5rem; }
            .gap-4 { gap: 1rem; }
            .text-blue-400 { color: #60a5fa; }
            .text-gray-400 { color: #9ca3af; }
            .text-gray-500 { color: #6b7280; }
            .border { border: 1px solid #374151; }
            .w-16 { width: 4rem; }
            .h-16 { height: 4rem; }
            .w-4 { width: 1rem; }
            .h-4 { height: 1rem; }
            .h-3 { height: 0.75rem; }
            @media print {
              body { background: white !important; color: black !important; }
              .bg-gray-800, .bg-gray-900 { background: #f3f4f6 !important; border: 1px solid #d1d5db; }
              .text-white { color: black !important; }
              .text-blue-400 { color: #1d4ed8 !important; }
              .text-gray-400 { color: #6b7280 !important; }
            }
          </style>
        </head>
        <body>
          ${painelContent}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Função de exportação para imagem usando captura de tela nativa
  const exportarImagem = async () => {
    try {
      // Verificar se a API de captura de tela está disponível
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        alert('Para exportar como imagem, use a funcionalidade de captura de tela do seu navegador (Ctrl+Shift+S no Chrome/Edge ou Cmd+Shift+4 no Safari) ou clique em "Exportar PDF" para uma versão imprimível.')
      } else {
        alert('Funcionalidade de captura de imagem não disponível neste navegador. Use "Exportar PDF" como alternativa.')
      }
    } catch (error) {
      console.error('Erro ao tentar capturar imagem:', error)
      alert('Use a funcionalidade de captura de tela do navegador ou "Exportar PDF".')
    }
  }

  const progressoGeral = calcularProgressoGeral()

  return (
    <div id="painel-bim" className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold">RBIM</span>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Painel BIM - Polícia Federal Belém/PA</h1>
              <p className="text-gray-400">Acompanhamento de Entregas por Etapas</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={exportarPDF}
              variant="outline" 
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button 
              onClick={exportarImagem}
              variant="outline" 
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <Image className="w-4 h-4 mr-2" />
              Exportar Imagem
            </Button>
          </div>
        </div>

        {/* Progresso Geral */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Progresso Geral do Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg">Progresso Total</span>
                <span className="text-2xl font-bold text-blue-400">{progressoGeral}%</span>
              </div>
              <Progress value={progressoGeral} className="h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Progresso por Etapas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {etapas.map(etapa => {
            const progressoEtapa = calcularProgressoEtapa(etapa.id)
            return (
              <Card key={etapa.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    {etapa.nome}
                    <Badge style={{ backgroundColor: etapa.cor }} className="text-white">
                      {etapa.peso}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Progresso</span>
                      <span className="font-bold">{progressoEtapa}%</span>
                    </div>
                    <Progress value={progressoEtapa} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Disciplinas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {disciplinas.map(disciplina => {
            const { status, cor } = getStatusDisciplina(disciplina)
            const progresso = progressoDisciplinas[disciplina.id] || { etapa1: 0, etapa2: 0, etapa3: 0 }
            const Icon = disciplina.icon

            return (
              <Card key={disciplina.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-6 h-6 text-blue-400 flex-shrink-0" />
                      <span className="text-sm">{disciplina.nome}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${cor} text-white`}>
                        {status}
                      </Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {disciplina.peso}%
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progresso por Etapa */}
                  <div className="grid grid-cols-3 gap-4">
                    {etapas.map(etapa => (
                      <div key={etapa.id} className="space-y-2">
                        <label className="text-sm text-gray-400">{etapa.nome}</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={progresso[`etapa${etapa.id}`]}
                          onChange={(e) => atualizarProgresso(disciplina.id, etapa.id, e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="0"
                        />
                        <div className="text-xs text-gray-500">
                          {progresso[`etapa${etapa.id}`]}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Observações */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Observações / Pendências</label>
                    <Textarea
                      value={observacoes[disciplina.id] || ''}
                      onChange={(e) => atualizarObservacao(disciplina.id, e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white resize-none"
                      placeholder="Adicione observações sobre o andamento desta disciplina..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>RBIM - Gestão de Projetos BIM | Prestação de Contas: Receita Federal e Embracol</p>
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
    </div>
  )
}

export default App

