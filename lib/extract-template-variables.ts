/**
 * Extracts Go template variables from HTML content
 * Finds variables in the format {{.variableName}}
 * Also extracted from control structures like {{range .items}}, {{if .condition}}, etc.
 * Supports unpacking syntax: {{range $i, $s := .items}}
 */

export function extractGoTemplateVariables(htmlContent: string): string[] {
  const variables: Set<string> = new Set()

  // Match patterns like {{.variableName}}, {{.variableName | someFilter}}, etc.
  // Also matches within control structures like {{range .items}}, {{if .condition}}, etc.
  // Supports unpacking: {{range $i, $s := .items}}
  const goTemplateRegex = /\{\{[\s]*(?:range|if|with|else if)?[\s]*(?:\$[a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*\$[a-zA-Z_][a-zA-Z0-9_]*)*\s*:=\s*)?\.([a-zA-Z_][a-zA-Z0-9_]*)/g

  let match
  while ((match = goTemplateRegex.exec(htmlContent)) !== null) {
    const variableName = match[1]
    // Only add if it's not a built-in like "else", "end", etc.
    if (variableName && !['else', 'end'].includes(variableName)) {
      variables.add(variableName)
    }
  }

  return Array.from(variables).sort()
}

/**
 * Merges extracted variables with existing variables in JSON format
 * Returns updated JSON with new variables as empty strings
 */
export function mergeVariablesWithJson(
  jsonContent: string,
  extractedVariables: string[]
): string {
  try {
    let parsedVariables: Record<string, any> = {}

    // Try to parse existing JSON
    if (jsonContent && jsonContent.trim() !== '{}') {
      try {
        parsedVariables = JSON.parse(jsonContent)
      } catch (e) {
        console.warn('Failed to parse existing variables JSON:', e)
        parsedVariables = {}
      }
    }

    // Add new variables if they don't exist
    let hasNewVariables = false
    for (const variable of extractedVariables) {
      if (!(variable in parsedVariables)) {
        // Add with empty string as default value
        parsedVariables[variable] = ''
        hasNewVariables = true
      }
    }

    // Only return if we actually added new variables
    if (hasNewVariables) {
      return JSON.stringify(parsedVariables, null, 2)
    }

    return jsonContent
  } catch (error) {
    console.error('Error merging variables:', error)
    return jsonContent
  }
}
