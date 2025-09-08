import z from 'zod/v4'

import type { $ToolParams } from '../../constants'

export const updateFileResultSchema = z.union([
  z.object({
    file: z.string(),
    message: z.string(),
    unifiedDiff: z.string(),
  }),
  z.object({
    file: z.string(),
    errorMessage: z.string(),
    patch: z.string().optional(),
  }),
])

const toolName = 'str_replace'
const endsAgentStep = false
export const strReplaceParams = {
  toolName,
  endsAgentStep,
  parameters: z
    .object({
      path: z
        .string()
        .min(1, 'Path cannot be empty')
        .describe(`The path to the file to edit.`),
      replacements: z
        .array(
          z
            .object({
              old: z
                .string()
                .min(1, 'Old cannot be empty')
                .describe(
                  `The string to replace. This must be an *exact match* of the string you want to replace, including whitespace and punctuation.`,
                ),
              new: z
                .string()
                .describe(
                  `The string to replace the corresponding old string with. Can be empty to delete.`,
                ),
              allowMultiple: z
                .boolean()
                .optional()
                .default(false)
                .describe(
                  'Whether to allow multiple replacements of old string.',
                ),
            })
            .describe('Pair of old and new strings.'),
        )
        .min(1, 'Replacements cannot be empty')
        .describe('Array of replacements to make.'),
    })
    .describe(`Replace strings in a file with new strings.`),
  outputs: z.tuple([
    z.object({
      type: z.literal('json'),
      value: updateFileResultSchema,
    }),
  ]),
} satisfies $ToolParams
