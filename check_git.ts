import { execSync } from 'child_process';

try {
  console.log(execSync('git status').toString());
} catch (e: any) {
  console.log(e.stdout.toString());
}
