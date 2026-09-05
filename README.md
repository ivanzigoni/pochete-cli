<img src="pochete.png" alt="pochete-cli" width="120" />

# pochete-cli

[![Última release](https://img.shields.io/github/v/release/ivanzigoni/pochete-cli)](https://github.com/ivanzigoni/pochete-cli/releases)
[![Licença](https://img.shields.io/github/license/ivanzigoni/pochete-cli)](LICENSE)
[![Status do workflow de tag](https://img.shields.io/github/actions/workflow/status/ivanzigoni/pochete-cli/tag.yml)](https://github.com/ivanzigoni/pochete-cli/actions/workflows/tag.yml)
[![Data da última release](https://img.shields.io/github/release-date/ivanzigoni/pochete-cli)](https://github.com/ivanzigoni/pochete-cli/releases)

O pochete-cli é a ferramenta de linha de comando que inicializa um workspace da
[pochete-toolkit](https://github.com/ivanzigoni/pochete-toolkit) com os repositórios de aplicação
já clonados dentro dele. Um único comando substitui os passos manuais de clonar o workspace, criar
o diretório `project/` e clonar cada repositório de aplicação ali dentro.

## Instalação

Rode:

```bash
curl -fsSL https://raw.githubusercontent.com/ivanzigoni/pochete-cli/main/install.sh | bash
```

O instalador baixa o script `pochete` para `~/.local/bin` (ou para o diretório definido em
`$POCHETE_INSTALL_DIR`) e o marca como executável. Se esse diretório não estiver no seu `PATH`, o
instalador avisa e mostra a linha para adicionar ao `~/.bashrc`.

## Atualização

Não há gerenciador de pacote nem subcomando de atualização automática. Para atualizar, rode
novamente o comando de instalação acima — ele sobrescreve o binário existente pela versão mais
recente.

## Uso

```bash
pochete clone <repo1> [repo2 ...] <workspace-name>
```

O subcomando `clone` executa dois passos:

1. Clona a [pochete-toolkit](https://github.com/ivanzigoni/pochete-toolkit) em
   `<workspace-name>` — a origem é fixa, não configurável por argumento.
2. Clona cada `<repoN>` informado dentro de `<workspace-name>/project/`.

O comando falha se `<workspace-name>` já existir, para nunca sobrescrever um diretório existente.

### Exemplo

```bash
pochete clone git@github.com:minha-org/meu-servico.git meu-workspace
```

Resulta em:

```
meu-workspace/
├── ...                    # arquivos da pochete-toolkit
└── project/
    └── meu-servico/
```

## Licença

Distribuído sob a licença Apache 2.0. Veja [LICENSE](LICENSE).
