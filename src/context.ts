import * as core from '@actions/core'
import * as csv from 'csv-parse/sync'

export interface Inputs {
  buildID: string
  tags: string[]
  target?: string
  token?: string
}

export function getInputs(): Inputs {
  return {
    buildID: core.getInput('build-id'),
    tags: parseCSV(core.getInput('tags')),
    target: core.getInput('target'),
    token: core.getInput('token') || process.env.DEPOT_TOKEN,
  }
}

function parseCSV(source: string): string[] {
  source = source.trim()

  if (source === '') return []

  const items: string[][] = csv.parse(source, {
    columns: false,
    relaxColumnCount: true,
    relaxQuotes: true,
    skipEmptyLines: true,
  })

  return items
    .flat()
    .map((i) => i.trim())
    .filter((i) => i)
}
