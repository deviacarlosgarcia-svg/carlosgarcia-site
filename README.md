# carlosgarcia.tech

Site profissional de Carlos Garcia: serviços de automação com n8n e agentes de IA, estudo de caso do assistente, trajetória e contato.

Site estático (HTML, CSS e JavaScript puros), sem build e sem dependências. Hospedagem: **GitHub Pages**, gratuito.

## Estrutura

| Arquivo | O que é |
| --- | --- |
| `index.html` | Página principal |
| `caso-assistente-ia.html` | Estudo de caso do assistente de IA |
| `privacidade.html` | Política de privacidade (LGPD) |
| `404.html` | Página de erro |
| `curriculo-carlos-eduardo.pdf` | Currículo para download |
| `assets/` | Estilos, script e fotos |
| `CNAME` | Diz ao GitHub Pages que o domínio é carlosgarcia.tech |
| `.nojekyll` | Publica os arquivos exatamente como estão |
| `robots.txt`, `sitemap.xml`, `favicon.svg` | SEO e ícone |
| `_headers` | Sem efeito no GitHub Pages; mantido para uma futura migração |

## Custos

| Item | Custo |
| --- | --- |
| GitHub Pages | Gratuito (exige repositório público) |
| Domínio carlosgarcia.tech | Já registrado; renovação anual na Hostinger |
| Formulário (n8n na sua VPS) | Sem custo extra |

O repositório precisa ser **público** no plano gratuito. Não há nada sigiloso nos arquivos: o endereço do webhook já fica visível em qualquer formulário de site.

## Publicação passo a passo

### 1. Subir os arquivos para o GitHub

1. Em github.com, crie um repositório **público** chamado `carlosgarcia-site`.
2. Clique em **uploading an existing file**, arraste **todo o conteúdo desta pasta** (inclusive `CNAME` e a pasta `assets`) e confirme em **Commit changes**.
   - O arquivo `.nojekyll` começa com ponto e pode ficar oculto no seu computador. Se não aparecer, tudo bem: o site funciona sem ele.

### 2. Ativar o GitHub Pages

1. No repositório: **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**; branch `main`, pasta `/ (root)`; **Save**.
3. Em **Custom domain**, confira se aparece `carlosgarcia.tech` (vem do arquivo `CNAME`). Se não aparecer, digite e salve.

### 3. Ajustar o DNS na Hostinger (somente 3 tipos de registro)

Antes de tudo, **tire um print da zona DNS inteira** (hPanel → Domínios → carlosgarcia.tech → DNS / Nameservers).

| Tipo | Nome | Ação | Valor |
| --- | --- | --- | --- |
| A | `@` | Apagar o atual (179.236.228.224) e criar 4 | 185.199.108.153 · 185.199.109.153 · 185.199.110.153 · 185.199.111.153 |
| AAAA | `@` | Apagar o atual e criar 4 | 2606:50c0:8000::153 · 2606:50c0:8001::153 · 2606:50c0:8002::153 · 2606:50c0:8003::153 |
| CNAME | `www` | Trocar o destino | `SEU-USUARIO.github.io` |

**Não mexa** em: `chat`, `n8n`, TXT `google-site-verification`, MX e nameservers. O `chat` e o `n8n` têm registros próprios apontando para a VPS e continuam funcionando.

A propagação pode levar de minutos a 4 horas.

### 4. Ativar o HTTPS

Volte em **Settings → Pages** e marque **Enforce HTTPS** quando a opção liberar. O GitHub pode levar até 24 horas para emitir o certificado.

### Como desfazer

Se algo sair errado, restaure os registros `A`, `AAAA` e `www` com os valores do print. Nada mais terá sido alterado.

### 5. Formulário de contato (já ligado ao n8n)

O formulário já aponta para o workflow **Site - Formulário de Contato**, que está em produção:

- Endpoint: `https://n8n.carlosgarcia.tech/webhook/contato-site`
- Campos enviados em JSON: `nome`, `email`, `mensagem` e `website` (honeypot: se vier preenchido, o n8n descarta como spam)
- O n8n valida os dados, envia o contato para o seu e-mail com resposta direta ao visitante e devolve `200` (ok) ou `400` (com a mensagem de erro, que o site mostra)

**Única pendência:** no nó **Webhook Contato**, o campo **Allowed Origins (CORS)** precisa incluir o novo domínio. O valor deve ficar assim:

```
https://n8n-pro-showcase.lovable.app,https://carlosgarcia.tech,https://www.carlosgarcia.tech
```

Sem isso, o navegador bloqueia o envio a partir do novo site.

Se o n8n estiver fora do ar, o visitante vê uma mensagem pedindo contato por WhatsApp ou e-mail. Para voltar ao modo só e-mail, deixe `data-webhook=""` no formulário de `index.html`.

A URL do webhook fica visível no código do site, como em qualquer formulário. Por isso a validação, o honeypot e a limitação de origem ficam no fluxo do n8n, não só no navegador.

## Como validar

- [ ] O site abre em `carlosgarcia.tech` e em `www.carlosgarcia.tech`, com cadeado (HTTPS)
- [ ] `chat.carlosgarcia.tech` continua funcionando
- [ ] No celular, o menu abre e fecha e nada fica cortado na lateral
- [ ] Os botões de WhatsApp abrem a conversa com o número certo
- [ ] O currículo baixa ao clicar em **Baixar currículo**
- [ ] Um envio de teste do formulário chega ao n8n
- [ ] Uma URL inexistente, como `/teste`, mostra a página 404

## Próximas atualizações previstas

- Vídeo de 2 a 3 minutos no estudo de caso (bloco comentado em `caso-assistente-ia.html`)
- Custo mensal real do assistente no estudo de caso
- Preços de referência nos pacotes, após o primeiro piloto
- Seção de casos com cliente real, quando houver autorização para publicar
