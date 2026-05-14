# ⚽ Formador de Times

> **Aplicativo web para formar times de futebol balanceados automaticamente**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-0.0.0-000000?style=for-the-badge)](https://ui.shadcn.com/)

## 📋 Índice

- [🎯 Sobre o Projeto](#-sobre-o-projeto)
- [✨ Funcionalidades](#-funcionalidades)
- [🚀 Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [📱 Screenshots](#-screenshots)
- [⚙️ Instalação](#️-instalação)
- [🔧 Como Usar](#-como-usar)
- [🏗️ Estrutura do Projeto](#️-estrutura-do-projeto)
- [🎨 Componentes UI](#-componentes-ui)
- [📱 Responsividade](#-responsividade)
- [🌙 Dark Mode](#-dark-mode)
- [🤝 Contribuindo](#-contribuindo)
- [📄 Licença](#-licença)

## 🎯 Sobre o Projeto

O **Formador de Times** é uma aplicação web moderna e intuitiva que permite aos usuários cadastrar jogadores de futebol e formar times automaticamente balanceados. Ideal para organizadores de peladas, treinadores e grupos de amigos que querem garantir partidas justas e competitivas.

### 🎮 Modalidade

- **🏟️ Society**: configure número de times e jogadores por time (posições: Gol, Zag, Lat D, Lat E, Volante, Meia, Ata)

## ✨ Funcionalidades

### 🎯 **Core Features**
- ✅ **Cadastro de Jogadores**: Nome, posição (Society) e nível (1–5 estrelas)
- ✅ **Formação Automática**: Distribuição dos jogadores nos times
- ✅ **Society**: Configure times e jogadores por time
- ✅ **Posições Society**: Gol, Zag, Lat D, Lat E, Volante, Meia, Ata

### 🎨 **UX/UI Features**
- 🎨 **Design Moderno**: Interface limpa e intuitiva
- 📱 **Totalmente Responsivo**: Funciona perfeitamente em mobile e desktop
- 🌙 **Dark Mode**: Suporte completo a tema escuro
- ⚽ **Loading Animado**: Bola de futebol estilizada durante processamento
- 🎭 **Gradientes e Animações**: Visual atrativo e profissional

### 🔧 **Funcionalidades Técnicas**
- ⚡ **Performance Otimizada**: Next.js 14 com App Router
- 🎯 **TypeScript**: Código tipado e seguro
- 🎨 **Tailwind CSS**: Estilização moderna e responsiva
- 🧩 **Componentes Reutilizáveis**: Arquitetura modular

## 🚀 Tecnologias Utilizadas

### **Frontend Framework**
- [Next.js 14](https://nextjs.org/) - Framework React com App Router
- [React 18](https://reactjs.org/) - Biblioteca para interfaces
- [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript tipado

### **Styling & UI**
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI modernos
- [Lucide React](https://lucide.dev/) - Ícones elegantes
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) - Sistema de cores dinâmico

### **Development Tools**
- [pnpm](https://pnpm.io/) - Gerenciador de pacotes rápido
- [ESLint](https://eslint.org/) - Linter para JavaScript/TypeScript
- [PostCSS](https://postcss.org/) - Processador CSS

## 📱 Screenshots

### 🖥️ Desktop View
![Desktop View](https://via.placeholder.com/800x500/1f2937/ffffff?text=Desktop+View)

### 📱 Mobile View
![Mobile View](https://via.placeholder.com/400x700/1f2937/ffffff?text=Mobile+View)

### ⚽ Loading Animation
![Loading Animation](https://via.placeholder.com/600x400/1f2937/ffffff?text=Loading+Animation)

## ⚙️ Instalação

### **Pré-requisitos**
- Node.js 18+
- pnpm (recomendado) ou npm

### **1. Clone o repositório**
```bash
git clone https://github.com/davi-montalvao/football-teams.git
cd football-teams
```

### **2. Instale as dependências**
```bash
# Com pnpm (recomendado)
pnpm install

# Ou com npm
npm install
```

### **3. Execute o projeto**
```bash
# Desenvolvimento
pnpm dev

# Ou
npm run dev
```

### **4. Acesse a aplicação**
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🔧 Como Usar

### **1. Configure o Society**
- Defina **quantos times** e **quantos jogadores por time**
- Confirme para ver a lista de jogadores disponíveis

### **2. Cadastre os Jogadores**
- **Nome**: Nome do jogador
- **Posição**: Posição Society
- **Estrelas**: Nível de 1 a 5

### **3. Forme os Times**
- Selecione os jogadores e clique em **"Gerar Times"**
- Use **"Gerar novamente"** para embaralhar a distribuição

### **4. Posições Society**

- Gol, Zag, Lat D, Lat E, Volante, Meia, Ata

## 🏗️ Estrutura do Projeto

```
football-teams/
├── app/                    # Next.js App Router
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/             # Componentes React
│   ├── ui/                # Componentes UI (shadcn/ui)
│   │   ├── button.tsx     # Botões
│   │   ├── card.tsx       # Cards
│   │   ├── input.tsx      # Campos de entrada
│   │   ├── select.tsx     # Seletores
│   │   ├── badge.tsx      # Badges
│   │   └── use-mobile.tsx # Hook de responsividade
│   └── theme-provider.tsx # Provedor de tema
├── hooks/                  # Hooks customizados
├── lib/                    # Utilitários
├── public/                 # Arquivos estáticos
├── styles/                 # Estilos adicionais
└── package.json            # Dependências e scripts
```

## 🎨 Componentes UI

### **shadcn/ui Components**
- **Button**: Botões com variantes e estados
- **Card**: Containers elegantes para conteúdo
- **Input**: Campos de entrada estilizados
- **Select**: Seletores dropdown responsivos
- **Badge**: Tags para informações e status
- **Form**: Formulários com validação

### **Componentes Customizados**
- **Loading Animation**: Bola de futebol animada
- **Player Card**: Card individual para jogadores
- **Team Display**: Visualização dos times formados

## 📱 Responsividade

### **Breakpoints**
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm - lg)
- **Desktop**: > 1024px (lg+)

### **Adaptações Mobile**
- Layout em coluna única
- Botões em largura total
- Textos menores e compactos
- Espaçamentos reduzidos
- Grid responsivo para cards

### **Hook useIsMobile**
```typescript
const isMobile = useIsMobile()
// Detecta automaticamente se está em mobile (< 768px)
```

## 🌙 Dark Mode

### **Sistema de Cores**
- **Light Theme**: Cores claras e suaves
- **Dark Theme**: Cores escuras e elegantes
- **Transições**: Mudança suave entre temas

### **Variáveis CSS**
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.25 0 0);
  /* ... outras variáveis */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... versões escuras */
}
```

## 🚀 Deploy

### **Vercel (Recomendado)**
1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente (se necessário)
3. Deploy automático a cada push

### **Netlify**
1. Importe do GitHub
2. Build command: `pnpm build`
3. Publish directory: `.next`

### **Outras Plataformas**
- **Railway**: Suporte nativo a Next.js
- **Render**: Deploy simples e rápido
- **AWS Amplify**: Para projetos empresariais

## 🤝 Contribuindo

### **Como Contribuir**
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### **Padrões de Código**
- Use TypeScript para todo novo código
- Siga o padrão de commits convencionais
- Mantenha a responsividade em mente
- Teste em diferentes dispositivos

### **Sugestões de Features**
- [ ] Sistema de login/usuários
- [ ] Histórico de partidas
- [ ] Estatísticas de jogadores
- [ ] Exportar times para PDF
- [ ] Integração com WhatsApp
- [ ] Modo offline (PWA)

## 🐛 Problemas Conhecidos

### **Limitações Atuais**
- Não salva dados entre sessões
- Algoritmo de balanceamento básico
- Sem validação de nomes duplicados

### **Soluções Futuras**
- Implementar localStorage/IndexedDB
- Algoritmo mais sofisticado de balanceamento
- Sistema de validação robusto

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Davim** - [GitHub](https://github.com/davi-montalvao)

## 🙏 Agradecimentos

- [shadcn/ui](https://ui.shadcn.com/) pelos componentes incríveis
- [Tailwind CSS](https://tailwindcss.com/) pelo framework de estilização
- [Next.js](https://nextjs.org/) pelo framework React
- [Lucide](https://lucide.dev/) pelos ícones elegantes

---

⭐ **Se este projeto te ajudou, considere dar uma estrela no GitHub!**

---

*Desenvolvido com ❤️ e ⚽ para a comunidade do futebol*
