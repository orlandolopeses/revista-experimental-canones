# Mesa da redação

A turma entra com o **nome de assinatura** (precisa estar em `site/redacao/colaboradores.json` ou ter feito a ficha neste navegador) e a **senha da redação** (`edicao-zero`). Rascunhos, imagens e o ID do YouTube ficam no IndexedDB do navegador. Enviar manda markdown + arquivos para `orlando.albertino@ufes.br`. O editor cola em `conteudo/` e `img/uploads/`, depois `python3 cms/build.py`.

Sveltia em `site/admin/` permanece para uso do editor, se quiser. A turma não passa por GitHub.

## O que é o quê

| Peça | Função |
| --- | --- |
| `site/admin/` | Sveltia, só se o editor quiser o GitHub. A turma não usa. |
| `site/conteudo/` | Fonte editorial: peças, indicações, notas de sala. |
| `cms/build.py` | Lê o markdown e escreve `site/pecas/`, `site/sala/`, `site/indicacoes/`. |
| `site/redacao/colaboradores.json` | Cadastro público da redação (byline, equipe, ofício; sem PII). |
| `site/redacao.html` | Estúdio: login, rascunhos, imagem, vídeo. |
| `cms/github/montar-revista.yml` | Action no repo Pages: gera HTML quando o markdown muda. |

Radar, vídeos.json e podcasts.json **não** passam pela mesa. Cadastro continua em `colaborar.html` (FormSubmit). Matrícula não se publica.

## Fluxo do aluno

1. Cadastro editorial, se ainda não fez.
2. Abrir `/redacao.html`, entrar com o nome de assinatura e a senha da redação.
3. Escrever, enviar. O rascunho sobrevive se fechar a aba.
4. O editor recebe o markdown, publica, e a peça aparece em Crítica ou Indicações.

## Fluxo do editor

1. Receber o e-mail (ou o `.md` baixado pelo aluno).
2. Gravar em `conteudo/pecas/` ou `conteudo/indicacoes/`.
3. `python3 cms/build.py` e publicar.

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
