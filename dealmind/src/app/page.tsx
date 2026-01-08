import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DealMind - Venda mais e melhor",
  description: "Assistente de inteligência artificial para aumentar suas vendas e produtividade",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                DealMind
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                Funcionalidades
              </Link>
              <Link href="#customers" className="text-gray-600 hover:text-blue-600 transition-colors">
                Clientes
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                Preços
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Venda mais e melhor
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            O DealMind analisa suas conversas para ajudar na priorização e tomada de decisões.
            Deixe a inteligência artificial trabalhar para você enquanto foca no que realmente importa: seus clientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              Começar Grátis
            </Link>
            <Link
              href="#demo"
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Agende sua Demo
            </Link>
          </div>

          {/* Security Badges */}
          <div className="flex items-center justify-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>SOC 2 Type 2</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>GDPR</span>
            </div>
          </div>

          {/* Demo Video Placeholder */}
          <div className="mt-12 bg-gray-900 rounded-2xl p-4 max-w-4xl mx-auto shadow-2xl">
            <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-blue-700 transition-colors">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
                <p className="text-gray-400">Assista ao demo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos */}
      <section className="py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm mb-8">Empresas que confiam no DealMind</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {["Buk", "Toku", "Pomelo", "Cobre", "Xepelin", "Pupila", "HealthAtom", "Jeeves"].map((company) => (
              <span key={company} className="text-xl font-bold text-gray-400 hover:text-gray-600 transition-colors">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Mais tempo para seus clientes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Automatize o preenchimento de CRM e deixe a IA cuidar das tarefas repetitivas enquanto você foca em vender.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Automação de CRM</h3>
              <p className="text-gray-600">
                Preenchimento automático de dados, criação de tarefas e atualização de oportunidades sem intervenção manual.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Análise em Tempo Real</h3>
              <p className="text-gray-600">
                Insights instantâneos sobre o andamento das suas conversas e sugestões de próximos passos.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Previsão de Vendas</h3>
              <p className="text-gray-600">
                Previsões baseadas em IA para identificar as melhores oportunidades e priorizar suas ações.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Integrações poderosas
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Conecte suas ferramentas favoritas e potencialize seu fluxo de vendas
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {["Zoom", "Google Calendar", "Microsoft Teams", "HubSpot", "WhatsApp", "Slack", "Pipedrive", "Salesforce"].map((tool) => (
              <span key={tool} className="px-4 py-2 bg-white rounded-lg text-gray-700 font-medium shadow-sm">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Cases de Uso
            </h2>
            <p className="text-xl text-gray-600">
              O DealMind se adapta ao seu fluxo de trabalho
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Prospecção", desc: "Identifique interesses e objeções automaticamente" },
              { title: "Vendas", desc: "Anotações e atualizações de CRM em tempo real" },
              { title: "Pós-venda", desc: "Alertas de riscos e acompanhamento de clientes" },
              { title: "Recrutamento", desc: "Documentação automática de entrevistas" },
              { title: "Produto", desc: "Coleta e análise de feedback de clientes" },
              { title: "Reuniões", desc: "Resumo e próximos passos automáticos" },
            ].map((useCase) => (
              <div key={useCase.title} className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="customers" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              O que dizem nossos clientes
            </h2>
            <p className="text-xl text-gray-400">
              Empresas que transformaram suas vendas com DealMind
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { company: "Toku", quote: "Aceleramos nosso processo de vendas em 3x", author: "Equipe de Vendas" },
              { company: "Buk", quote: "Economizamos mais de 44 horas por semana", author: "Gerência Comercial" },
            ].map((testimonial) => (
              <div key={testimonial.company} className="bg-gray-800 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                    {testimonial.company[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.company}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.author}</p>
                  </div>
                </div>
                <p className="text-lg text-gray-300 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Pronto para vender mais?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de equipes que já usam o DealMind
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Começar Grátis
            </Link>
            <Link
              href="#"
              className="bg-transparent text-white px-8 py-4 rounded-full font-semibold text-lg border-2 border-white hover:bg-white/10 transition-colors"
            >
              Falar com Especialista
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {[
              { q: "O que é o DealMind?", a: "O DealMind é um assistente de inteligência artificial que analisa suas conversas para ajudar na priorização e tomada de decisões de vendas." },
              { q: "Como funciona?", a: "O DealMind se integra às suas ferramentas de comunicação e CRM, analisando automaticamente suas conversas para extrair insights e automatizar tarefas repetitivas." },
              { q: "Para quem é o DealMind?", a: "O DealMind é ideal para equipes comerciais, departamentos de vendas, consultores e qualquer profissional que trabalha com vendas B2B." },
              { q: "O DealMind é seguro?", a: "Sim! O DealMind possui certificação SOC 2 Type 2 e está em conformidade com o GDPR, garantindo a segurança dos seus dados." },
            ].map((faq) => (
              <details key={faq.q} className="group border border-gray-200 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-medium text-gray-900">
                  {faq.q}
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="p-6 pt-0 text-gray-600">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">DealMind</h3>
              <p className="text-gray-400 text-sm">
                Assistente de IA para transformar suas vendas
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Funcionalidades</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Preços</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Integrações</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Sobre nós</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Carreiras</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contato</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacidade</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Termos</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Segurança</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-500 text-sm">
              © 2025 DealMind. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span className="text-gray-500 text-sm">Brasil</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
