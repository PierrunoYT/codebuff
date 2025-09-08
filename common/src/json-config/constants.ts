import { MAX_AGENT_STEPS_DEFAULT } from '../constants/agents'
import { z } from 'zod/v4'

export const codebuffConfigFile = 'codebuff.json'
export const codebuffConfigFileBackup = 'codebuff.jsonc'

export const StartupProcessSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Process name is required')
      .describe(
        'A user-friendly name for the process. Should be one word and unique.',
      ),
    command: z
      .string()
      .min(1, 'Command is required')
      .describe('The actual shell command to execute.'),
    cwd: z
      .string()
      .optional()
      .describe('The working directory from which to run the command.'),
    enabled: z
      .boolean()
      .optional()
      .default(true)
      .describe('Whether this process should be run'),
    stdoutFile: z
      .string()
      .optional()
      .describe(
        "Path to write the process's stdout. If not specified, stderr is not stored.",
      ),
    stderrFile: z
      .string()
      .optional()
      .describe(
        "Path to write the process's stderr. If not specified, stderr will be put into the stdoutFile.",
      ),
  })
  .describe('Defines a single startup process.')

export const FileChangeHook = z
  .object({
    name: z
      .string()
      .min(1, 'Hook name is required')
      .describe(
        'A user-friendly name for the hook. Should be one word and unique.',
      ),
    command: z
      .string()
      .min(1, 'Command is required')
      .describe('The actual shell command to execute.'),
    cwd: z
      .string()
      .optional()
      .describe('The working directory from which to run the command.'),
    filePattern: z.string().optional().describe('Glob pattern to match files.'),
    enabled: z
      .boolean()
      .optional()
      .default(true)
      .describe('Whether this command should be run'),
  })
  .describe('Defines a single file change hook.')

export const CodebuffConfigSchema = z
  .object({
    description: z
      .any()
      .optional()
      .describe('Does nothing. Put any thing you want here!'),
    startupProcesses: z
      .array(StartupProcessSchema)
      .optional()
      .describe('An array of startup processes.'),
    fileChangeHooks: z
      .array(FileChangeHook)
      .optional()
      .describe('An array of commands to run on file changes.'),
    maxAgentSteps: z
      .number()
      .optional()
      .default(MAX_AGENT_STEPS_DEFAULT)
      .describe(
        'Maximum number of turns agent will take before being forced to end',
      ),
    baseAgent: z.string().optional().describe('Specify default base agent'),
    spawnableAgents: z
      .array(z.string())
      .optional()
      .describe('Specify complete list of spawnable agents for the base agent'),
  })
  .describe(
    `Defines the overall Codebuff configuration file (e.g., ${codebuffConfigFile}). This schema defines the top-level structure of the configuration. This schema can be found at https://www.codebuff.com/config`,
  )

/**
 * TypeScript type representing a validated startup process object.
 * This type is inferred from the `StartupProcessSchema` and provides type safety
 * when working with startup process configurations in code.
 */
export type StartupProcess = z.infer<typeof StartupProcessSchema>

/**
 * TypeScript type representing a validated Codebuff configuration object.
 * This type is inferred from the `CodebuffConfigSchema` and provides type safety
 * for the entire configuration structure.
 */
export type CodebuffConfig = z.infer<typeof CodebuffConfigSchema>
