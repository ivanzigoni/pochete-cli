#!/usr/bin/env node
import { Command } from 'commander';
import { registerCloneCommand, usage as cloneUsage } from './commands/clone.js';
import { registerInitCommand } from './commands/init.js';

const KNOWN_SUBCOMMANDS = ['clone', 'init'];

function usage(): string {
  return [cloneUsage(), 'uso: pochete init'].join('\n');
}

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

  if (!KNOWN_SUBCOMMANDS.includes(subcommand)) {
    console.error(`subcomando desconhecido: '${subcommand}'`);
    console.error(usage());
    process.exit(1);
    return;
  }

  const program = new Command();
  program.name('pochete').helpOption(false).addHelpCommand(false);
  registerCloneCommand(program);
  registerInitCommand(program);

  await program.parseAsync(['node', 'pochete', subcommand, ...rest]);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
