# 🚀 Guia Rápido de Deploy

## Opção 1: Vercel + Neon (Mais Fácil e Gratuito)

### 1. Preparar o Banco de Dados (Neon)

1. Acesse https://neon.tech e crie uma conta
2. Clique em "Create Project"
3. Escolha um nome (ex: "paroquia-sao-sebastiao")
4. Selecione a região mais próxima (US East é ok)
5. Copie a connection string que aparece (algo como: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb`)

### 2. Deploy no Vercel

1. Instale o Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Faça login:
   ```bash
   vercel login
   ```

3. No diretório do projeto, execute:
   ```bash
   vercel
   ```

4. Siga as instruções:
   - Link to existing project? **No**
   - Project name: **paroquia-sao-sebastiao**
   - Directory: **(deixe em branco)**
   - Override settings? **No**

### 3. Configurar Variáveis de Ambiente

1. Acesse o projeto no dashboard da Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione as seguintes variáveis:

```
DATABASE_URL=postgresql://neondb_owner:npg_u2iWQ9PFqkpX@ep-little-tooth-aczbtfe7-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NEXTAUTH_URL=https://paroquia-sao-sebastiao.vercel.app

NEXTAUTH_SECRET=3c74a2acf988a82b844b699bc075db2a

ADMIN_EMAIL=admin@paroquiasaosebastiao.com.br

ADMIN_PASSWORD=Admin@123456
```

### 4. Deploy e Migrations

1. Redeploy o projeto:
   ```bash
   vercel --prod
   ```

2. Execute as migrations no banco de dados:
   - Localmente, com a DATABASE_URL do Neon configurada no .env:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

✅ **Pronto!** Seu site está no ar em `https://seu-projeto.vercel.app`

---

## Opção 2: Railway (Tudo-em-Um)

### 1. Criar Conta no Railway

1. Acesse https://railway.app
2. Crie uma conta (pode usar GitHub)

### 2. Deploy pelo GitHub

1. Crie um repositório no GitHub com seu código
2. No Railway, clique em "New Project"
3. Escolha "Deploy from GitHub repo"
4. Selecione seu repositório

### 3. Adicionar PostgreSQL

1. No projeto Railway, clique em "New"
2. Escolha "Database" → "Add PostgreSQL"
3. Railway criará automaticamente o banco e a variável DATABASE_URL

### 4. Configurar Variáveis

Adicione as variáveis no Railway:

```
NEXTAUTH_URL=https://seu-projeto.up.railway.app
NEXTAUTH_SECRET=(gere uma chave)
ADMIN_EMAIL=admin@paroquiasaosebastiao.com.br
ADMIN_PASSWORD=Admin@123456
```

### 5. Executar Migrations

No Railway CLI ou terminal local:
```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## Opção 3: Render (Gratuito com Limitações)

### 1. Banco de Dados

1. Acesse https://render.com
2. Crie um "PostgreSQL" gratuito
3. Copie a "External Database URL"

### 2. Deploy da Aplicação

1. Conecte seu repositório GitHub
2. Crie um novo "Web Service"
3. Configure:
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

### 3. Variáveis de Ambiente

Adicione no dashboard:
- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- ADMIN_EMAIL
- ADMIN_PASSWORD

---

## ⚙️ Configurações Importantes

### Domínio Personalizado

#### No Vercel:
1. Vá em **Settings** → **Domains**
2. Adicione seu domínio (ex: paroquiasaosebastiao.com.br)
3. Configure os DNS conforme instruções

#### Registros DNS Necessários:
```
Tipo: A
Nome: @
Valor: 76.76.21.21

Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

### SSL/HTTPS

Todos os provedores (Vercel, Railway, Render) fornecem SSL gratuito automaticamente via Let's Encrypt.

---

## 📊 Custos Mensais Estimados

### Opção Gratuita (Recomendado para Começar):
- **Vercel:** Gratuito (100 GB de largura de banda)
- **Neon PostgreSQL:** Gratuito (500 MB de storage)
- **Total:** R$ 0/mês

### Crescimento Futuro:
- **Vercel Pro:** ~$20/mês (~R$ 100)
- **Neon Paid:** ~$19/mês (~R$ 95)
- **Domínio .com.br:** ~R$ 40/ano

---

## 🔒 Checklist de Segurança Pós-Deploy

- [ ] Alterar senha padrão do admin
- [ ] Gerar NEXTAUTH_SECRET único
- [ ] Configurar NEXTAUTH_URL corretamente
- [ ] Habilitar 2FA no Vercel/Railway
- [ ] Fazer backup regular do banco
- [ ] Configurar alertas de uptime
- [ ] Revisar permissões de usuários

---

## 📈 Monitoramento

### Vercel Analytics (Recomendado)
1. Habilite no dashboard: **Analytics**
2. Veja visitantes, performance, etc.

### Google Analytics (Opcional)
1. Crie uma propriedade no Google Analytics
2. Adicione o código de tracking no `app/layout.tsx`

---

## 🆘 Problemas Comuns

### Erro ao conectar ao banco:
✅ Verifique se DATABASE_URL está correta
✅ Confira se as migrations foram executadas
✅ Teste a conexão: `npx prisma db pull`

### Página 500 após deploy:
✅ Veja os logs no dashboard do provedor
✅ Verifique se todas as variáveis de ambiente estão configuradas
✅ Execute `npm run build` localmente para verificar erros

### Admin não consegue fazer login:
✅ Verifique se o seed foi executado
✅ Confirme as credenciais em ADMIN_EMAIL e ADMIN_PASSWORD
✅ Execute novamente: `npx prisma db seed`

---

**🎉 Parabéns! Seu site está no ar!**

Próximos passos:
1. Configure seu domínio personalizado
2. Personalize cores e conteúdo
3. Adicione fotos e informações da paróquia
4. Divulgue para a comunidade!
