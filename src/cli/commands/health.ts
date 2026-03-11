import type { Command } from 'commander';
import { hanumanFetch } from '../http.ts';
import { printJson } from '../format.ts';

export function registerHealth(program: Command): void {
  program
    .command('health')
    .description('Check if Hanuman server is running and healthy')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const data = await hanumanFetch('/api/health');
      if (opts.json) return printJson(data);
      console.log(`Status: ${data.status}`);
      console.log(`Server: ${data.server}`);
      console.log(`Port:   ${data.port}`);
    });
}
