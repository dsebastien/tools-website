/**
 * Shared tool search utility using fuzzy search
 *
 * Provides consistent, typo-tolerant search across all tool search interfaces
 */

import { fuzzySearch, type FuzzySearchConfig } from '@/lib/fuzzy-search'
import type { Tool } from '@/types/tool'

/**
 * Field names that can be searched in a tool
 */
type ToolSearchField = 'name' | 'description' | 'labels' | 'technologies' | 'category'

/**
 * Standard field weights for tool search
 * Higher weights = more importance in ranking
 */
export const TOOL_SEARCH_CONFIG: FuzzySearchConfig<ToolSearchField> = {
    fields: {
        name: { weight: 5 },
        description: { weight: 3 },
        labels: { weight: 2 },
        technologies: { weight: 2 },
        category: { weight: 1 }
    }
}

/**
 * Get field value from a tool for search
 */
function getToolFieldValue(tool: Tool, field: ToolSearchField): string | string[] | null {
    switch (field) {
        case 'name':
            return tool.name
        case 'description':
            return tool.description
        case 'labels':
            return tool.labels
        case 'technologies':
            return tool.technologies
        case 'category':
            return tool.category
        default:
            return null
    }
}

/**
 * Search tools using fuzzy search
 *
 * Returns tools that match the query, sorted by relevance.
 * Returns empty array if query is empty.
 *
 * @param tools - The tools to search through
 * @param query - The search query
 * @returns Sorted array of matching tools (best matches first)
 *
 * @example
 * ```ts
 * // Finds "Obsidian Starter Kit" with typo-tolerant search
 * const results = searchTools(tools, 'obsk')
 *
 * // Can also handle typos
 * const results = searchTools(tools, 'templt')
 * ```
 */
export function searchTools(tools: Tool[], query: string): Tool[] {
    return fuzzySearch(tools, query, TOOL_SEARCH_CONFIG, getToolFieldValue)
}
