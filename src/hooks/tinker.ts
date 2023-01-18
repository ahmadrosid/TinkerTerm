import { spawn } from 'child_process';
import { useState } from 'react';

const sendCommand = (text: string, onSuccess: Function, onError: Function) => {
  const tinker = spawn('php', ['artisan', 'tinker'], {cwd: '/Users/ahmadrosid/bitbucket.com/splade'});
  tinker.stdout.on('data', (data) => {
    onSuccess(data)
  });
  
  tinker.stderr.on('data', (data) => {
    onError(data)
  });
  
  tinker.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
  
  tinker.stdin.write(text);
  tinker.stdin.end()
}

type ReturnTinker = [string | undefined, string | undefined, (text: string) => void];

export default function useTinker(): ReturnTinker {
  const [stdout, setStdout] = useState<string>();
  const [stderr, setStderr] = useState<string>();

  const onSuccess = (data: string) => {
    setStdout(prev => prev + "\n" + data)
  }

  const onError = (data: string) => {
    setStderr(data)
  }

  const exectCode = (text: string) => {
    // sendCommand(text, onSuccess, onError)
  }

  return [stdout, stderr, exectCode]
}
