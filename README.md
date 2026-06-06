# 🏛️ Sistema de Gerenciamento - Paróquia São Sebastião

Sistema completo para gerenciamento do site da Paróquia São Sebastião do Bairro Três Barras, Cuiabá-MT.

## 🚀 Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização moderna e responsiva
- **Prisma** - ORM para banco de dados
- **NextAuth.js** - Autenticação
- **PostgreSQL** - Banco de dados
- **Chart.js** - Gráficos e dashboards
- **Lucide React** - Ícones modernos

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado (ou conta em serviço cloud)
- npm ou yarn

## 🔧 Instalação

### 1. Clone ou extraia o projeto

```bash
cd paroquia-sao-sebastiao
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```env
# Database - Altere com suas credenciais
DATABASE_URL="postgresql://usuario:senha@localhost:5432/paroquia_db?schema=public"

# NextAuth - Gere uma chave secreta única
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-super-segura-aqui"

# Admin padrão (será criado no primeiro setup)
ADMIN_EMAIL="admin@paroquiasaosebastiao.com.br"
ADMIN_PASSWORD="Admin@123456"
ADMIN_NAME="Administrador"
```

**⚠️ IMPORTANTE:** Gere uma chave secreta única para NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4. Configure o banco de dados

```bash
# Crie as tabelas no banco de dados
npx prisma migrate dev --name init

# Crie o usuário administrador inicial
npx prisma db seed
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## 👤 Login no Sistema

### Credenciais Padrão:
- **Email:** admin@paroquiasaosebastiao.com.br
- **Senha:** Admin@123456

**⚠️ IMPORTANTE:** Altere a senha após o primeiro login!

## 📁 Estrutura do Projeto

```
paroquia-sao-sebastiao/
├── app/
│   ├── (site)/              # Rotas públicas do site
│   ├── admin/               # Painel administrativo
│   ├── api/                 # API Routes
│   │   └── auth/           # Autenticação NextAuth
│   ├── auth/               # Páginas de autenticação
│   ├── layout.tsx          # Layout raiz
│   ├── page.tsx            # Página inicial
│   └── globals.css         # Estilos globais
├── components/
│   ├── admin/              # Componentes do painel admin
│   └── Providers.tsx       # Provider de sessão
├── lib/
│   ├── auth.ts             # Configuração NextAuth
│   ├── prisma.ts           # Cliente Prisma
│   └── utils.ts            # Utilitários
├── prisma/
│   ├── schema.prisma       # Schema do banco de dados
│   └── seed.ts             # Script de seed
└── types/
    └── next-auth.d.ts      # Types do NextAuth
```

## 🎨 Funcionalidades

### Site Público (/)
- ✅ Página inicial moderna e responsiva
- ✅ Informações sobre a paróquia
- ✅ Horários de missas
- ✅ Eventos e celebrações
- ✅ Contato e localização

### Painel Administrativo (/admin)
- ✅ Dashboard com estatísticas
- ✅ Gráficos de visitantes e doações
- ✅ Gerenciamento de posts/notícias
- ✅ Gerenciamento de eventos
- ✅ Controle de horários de missas
- ✅ Registro de sacramentos
- ✅ Controle de doações
- ✅ Galeria de fotos
- ✅ Newsletter
- ✅ Gerenciamento de usuários
- ✅ Sistema de autenticação completo

## 🔐 Níveis de Acesso

- **ADMIN** - Acesso total ao sistema
- **EDITOR** - Pode criar e editar conteúdo
- **USER** - Acesso limitado (visualização)

## 🗄️ Banco de Dados

### Modelos Principais:

- **User** - Usuários do sistema
- **Post** - Posts/notícias
- **Event** - Eventos e celebrações
- **Mass** - Horários de missas
- **Sacrament** - Registros de sacramentos
- **Donation** - Controle de doações
- **Gallery** - Galerias de fotos
- **Newsletter** - Inscritos no newsletter

## 🚀 Deploy

### Recomendado: Vercel + Neon (PostgreSQL)

1. **Banco de Dados (Neon):**
   - Crie uma conta em https://neon.tech
   - Crie um novo projeto PostgreSQL
   - Copie a connection string

2. **Deploy (Vercel):**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Configure as variáveis de ambiente no Vercel:**
   - DATABASE_URL
   - NEXTAUTH_URL
   - NEXTAUTH_SECRET
   - ADMIN_EMAIL
   - ADMIN_PASSWORD

4. **Execute as migrations:**
   ```bash
   npx prisma migrate deploy
   ```

### Alternativas de Hospedagem:

- **Railway** - https://railway.app
- **Render** - https://render.com
- **Fly.io** - https://fly.io
- **DigitalOcean App Platform**

## 📊 Dashboards e Relatórios

O painel administrativo inclui:

- Estatísticas em tempo real
- Gráficos de visitantes
- Relatórios de doações
- Atividades recentes
- Métricas de engajamento

## 🎨 Customização

### Cores da Paróquia

Edite `tailwind.config.ts`:

```typescript
parish: {
  gold: '#D4AF37',
  blue: '#1e40af',
  lightBlue: '#60a5fa',
}
```

### Logo e Imagens

Adicione suas imagens em `public/`:
- `/public/logo.png` - Logo da paróquia
- `/public/images/` - Imagens do site

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Prisma Studio (visualizar banco de dados)
npx prisma studio

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Resetar banco de dados
npx prisma migrate reset
```

## 📝 Próximos Passos

1. [ ] Personalizar cores e logo
2. [ ] Adicionar conteúdo real (textos, imagens)
3. [ ] Configurar domínio personalizado
4. [ ] Adicionar Google Analytics
5. [ ] Configurar backup automático do banco
6. [ ] Implementar envio de emails
7. [ ] Integrar com Google Calendar
8. [ ] Adicionar mapa de localização

## 🆘 Suporte

Para dúvidas ou problemas:

1. Verifique a documentação do Next.js: https://nextjs.org/docs
2. Documentação do Prisma: https://www.prisma.io/docs
3. Documentação do NextAuth: https://next-auth.js.org

## 📄 Licença

Este projeto foi desenvolvido especificamente para a Paróquia São Sebastião - Três Barras, Cuiabá-MT.

---

**Desenvolvido por J2z com ❤️ para a Paróquia São Sebastião**
