import * as exec from '@actions/exec'
import * as io from '@actions/io'
import type {Options} from 'execa'
import {execa} from 'execa'
import type {Inputs} from './context'

export async function isInstalled(): Promise<boolean> {
  try {
    const {exitCode} = await exec.getExecOutput('depot', [], {ignoreReturnCode: true, silent: true})
    return exitCode === 0
  } catch {
    return false
  }
}

export async function version() {
  await exec.exec('depot', ['version'], {failOnStdErr: false})
}

async function execDepot(cmd: string, args: string[], options?: Options) {
  const resolved = await io.which(cmd, true)
  console.log(`[command]${resolved} ${args.join(' ')}`)
  const proc = execa(resolved, args, {...options, reject: false, stdin: 'inherit', stdout: 'pipe', stderr: 'pipe'})

  if (proc.pipeStdout) proc.pipeStdout(process.stdout)
  if (proc.pipeStderr) proc.pipeStderr(process.stdout)

  function signalHandler(signal: NodeJS.Signals) {
    proc.kill(signal)
  }

  process.on('SIGINT', signalHandler)
  process.on('SIGTERM', signalHandler)

  try {
    const res = await proc
    if (res.stderr.length > 0 && res.exitCode !== 0) {
      throw new Error(`failed with: ${res.stderr.match(/(.*)\s*$/)?.[0]?.trim() ?? 'unknown error'}`)
    }
  } finally {
    process.off('SIGINT', signalHandler)
    process.off('SIGTERM', signalHandler)
  }
}

export async function push(inputs: Inputs) {
  const args = [...flag('--tag', inputs.tags), ...flag('--target', inputs.target)]

  const token = inputs.token ?? process.env.DEPOT_TOKEN

  await execDepot('depot', ['push', ...args, inputs.buildID], {
    env: {...process.env, ...(token ? {DEPOT_TOKEN: token} : {})},
  })
}

function flag(name: string, value: string | string[] | boolean | undefined): string[] {
  if (!value) return []
  if (value === true) return [name]
  if (Array.isArray(value)) return value.flatMap((item) => [name, item])
  return [name, value]
}
