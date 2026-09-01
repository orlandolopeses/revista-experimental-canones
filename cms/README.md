# Mesa da redação (CMS)

A turma escreve markdown; um script gera o HTML no chrome da revista; o GitHub Pages publica. O editor responsável aceita o texto antes de ir ao ar.

## O que é o quê

| Peça | Função |
| --- | --- |
| `site/admin/` | Mesa (Sveltia CMS). Os alunos autenticam no GitHub e editam. |
| `site/conteudo/` | Fonte editorial: peças, indicações, notas de sala. |
| `cms/build.py` | Lê o markdown e escreve `site/pecas/`, `site/sala/`, `site/indicacoes/`. |
| `site/redacao.html` | Guia da turma. |
| `cms/github/montar-revista.yml` | Action no repo Pages: gera HTML quando o markdown muda. |

Radar, vídeos.json e podcasts.json **não** passam pela mesa. Cadastro continua em `colaborar.html` (FormSubmit). Matrícula não se publica.

## Fluxo do aluno

1. Conta no GitHub.
2. Convite de colaborador (Write) no repo `orlandolopeses/revista-experimental-canones`.
3. Abrir `/admin/`, autenticar, escrever a peça, submeter.
4. O texto vira pull request (`publish_mode: editorial_workflow`).
5. Orlando faz merge. A Action monta o HTML e a peça entra no ar.

Até haver OAuth da disciplina, a mesa pede um **token** do GitHub (botão “Sign in with token”). O diálogo aponta a página com os escopos marcados. Não é a senha da conta.

## Fluxo do editor

1. Convidar a conta GitHub do aluno (Write, não Admin).
2. Proteger `main` para exigir PR, se ainda não estiver.
3. Revisar PRs com o rótulo `sveltia-cms/`.
4. Depois do merge, conferir a peça em `/pecas/` ou `/indicacoes/`.

OAuth em escala de turma (login sem token) pede um GitHub OAuth App + [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) num Cloudflare Worker. Callback: `https://<worker>/callback`. Segredos: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ALLOWED_DOMAINS`. Sem isso, token basta para testar e para um grupo pequeno.

## Fonte de verdade

Depois que a turma escreve na mesa, o **repo Pages** é a fonte do conteúdo editorial (`conteudo/`). O monorepo guarda miner, pacotes de aula e o chrome. Não fazer `rsync --delete` de `site/` por cima de `conteudo/` no Pages — apaga peça de aluno.

Montar localmente:

```bash
python3 cms/build.py
python3 -m http.server 8765 --directory site
```

Publicar o chrome + a mesa (não usa `--delete` em `conteudo/`):

```bash
bash cms/publicar.sh
```
