
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, FileSearch, ShieldCheck, Banknote, Smartphone, CheckCircle, Search } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded flex items-center justify-center text-white font-bold shadow">
            V
          </div>
          <span className="font-bold text-xl tracking-tight text-emerald-950">VOS</span>
        </div>
        <Link href="/login">
          <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold">
            Acessar Sistema
          </Button>
        </Link>
      </nav>

      {/* HERO SECTION */}
      <section className="container mx-auto px-6 py-12 md:py-20 text-center space-y-6">
        <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          Campus Manaus Centro
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-neutral-900 tracking-tight max-w-4xl mx-auto leading-tight">
          <span className="text-emerald-600">Validação de Ordem de Serviços</span>
        </h1>
        <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto italic">
          "Seja forte e corajoso" — Josué 1:9
        </p>
        <p className="text-neutral-600 max-w-2xl mx-auto pt-4">
          A plataforma VOS revoluciona a gestão dos sistemas de refrigeração do campus com eficiência, economia e total transparência. A administração pública paga apenas pelo que foi realmente executado e comprovado.
        </p>
        <div className="pt-8">
          <Link href="/login">
            <Button size="lg" className="h-14 px-8 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 transaction-all hover:scale-105">
              Entrar na Plataforma <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section className="bg-neutral-50 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-neutral-800">Como Funciona o Fluxo VOS</h2>
            <p className="text-neutral-500">Simplicidade e controle em cada etapa do processo.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl select-none">1</div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Solicitação Ágil</h3>
              <p className="text-neutral-600 text-sm">O servidor identifica o problema e abre um chamado em segundos, direto pelo celular ou QR Code do equipamento.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl select-none">2</div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Execução Comprovada</h3>
              <p className="text-neutral-600 text-sm">O técnico realiza o serviço e é <strong>obrigado</strong> a enviar fotos do ANTES e DEPOIS para comprovar a execução.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl select-none">3</div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Validação Segura</h3>
              <p className="text-neutral-600 text-sm">O fiscal ou solicitante valida o serviço com base nas evidências. O pagamento só é liberado após o "De Acordo".</p>
            </div>
          </div>
        </div>
      </section>

      {/* ADVANTAGES SECTION */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-neutral-900 leading-tight">Vantagens para a <br /> Administração Pública</h2>

            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-800">Economia Real</h4>
                <p className="text-sm text-neutral-600">Fim dos pagamentos por estimativa "full". Pague apenas pelas peças trocadas e serviços efetivamente realizados.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-800">Transparência Total</h4>
                <p className="text-sm text-neutral-600">Todo serviço gera um rastro auditável com data, hora, responsável e evidências fotográficas imutáveis.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-800">Gestão Baseada em Dados</h4>
                <p className="text-sm text-neutral-600">Sabemos exatamente quais equipamentos dão mais defeito e quais marcas têm melhor durabilidade.</p>
              </div>
            </div>
          </div>

          {/* Visual Representation */}
          <div className="bg-neutral-100 rounded-2xl p-8 aspect-square flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/50 to-blue-50/50"></div>
            {/* Abstract Dashboard Mockup */}
            <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-4 relative z-10 rotate-3 border border-neutral-200/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="space-y-3">
                <div className="h-8 bg-neutral-100 rounded w-3/4"></div>
                <div className="h-32 bg-emerald-50 rounded border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  Economia de 30%
                </div>
                <div className="h-4 bg-neutral-100 rounded w-1/2"></div>
                <div className="h-4 bg-neutral-100 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-neutral-900 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="font-bold text-lg mb-2">IFAM - Campus Manaus Centro</p>
          <p className="text-neutral-500 text-sm">Departamento de Manutenção e Infraestrutura</p>
          <div className="mt-8 text-neutral-600 text-xs">
            &copy; 2024 Plataforma VOS. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}
