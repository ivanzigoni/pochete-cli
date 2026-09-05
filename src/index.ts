#!/usr/bin/env node
import { Command } from 'commander';
import { registerCloneCommand, usage } from './commands/clone.js';

async function main(): Promise<void> {
  const [subcommand, ...rest] = process.argv.slice(2);

  if (
    subcommand === undefined ||
    subcommand === '' ||
    subcommand === '-h' ||
    subcommand === '--help'
  ) {
    console.error(usage());
    process.exit(1);
    return;
  }

  if (subcommand !== 'clone') {
    console.error(`subcomando desconhecido: '${subcommand}'`);
    console.error(usage());
    process.exit(1);
    return;
  }

  const program = new Command();
  program.name('pochete').helpOption(false).addHelpCommand(false);
  registerCloneCommand(program);

  await program.parseAsync(['node', 'pochete', 'clone', ...rest]);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
