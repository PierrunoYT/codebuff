import z from 'zod/v4'

import { fileContentsSchema } from './read-files'

import type { $ToolParams } from '../../constants'

const toolName = 'find_files'
const endsAgentStep = true
export const findFilesParams = {
  toolName,
  endsAgentStep,
  parameters: z
    .object({
      prompt: z
        .string()
        .min(1, 'Prompt cannot be empty')
        .describe(
          `A brief natural language description of the files or the name of a function or class you are looking for. It's also helpful to mention a directory or two to look within.`,
        ),
    })
    .describe(
      `Find several files related to a brief natural language description of the files or the name of a function or class you are looking for.`,
    ),
  outputs: z.tuple([
    z.object({
      type: z.literal('json'),
      value: z.union([
        fileContentsSchema.array(),
        z.object({
          message: z.string(),
        }),
      ]),
    }),
  ]),
} satisfies $ToolParams
