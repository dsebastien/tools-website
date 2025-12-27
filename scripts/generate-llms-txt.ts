#!/usr/bin/env tsx
/**
 * Generates llms.txt - a machine-readable summary for AI crawlers.
 * This file helps LLMs understand the site structure and content.
 */

import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface Tool {
    id: string
    name: string
    description: string
    labels: string[]
    category: string
    url: string
    free: boolean
    technologies: string[]
    license?: string
    sourceCodeUrl?: string
}

interface ToolsData {
    tools: Tool[]
}

// Load tools data
const toolsJsonPath = join(__dirname, '../src/data/tools.json')
const toolsData: ToolsData = JSON.parse(readFileSync(toolsJsonPath, 'utf-8'))
const tools = toolsData.tools

// Get unique categories
const categories = Array.from(new Set(tools.map((t) => t.category))).sort()

// Count labels
const labelCounts = new Map<string, number>()
tools.forEach((tool) => {
    tool.labels.forEach((label) => {
        labelCounts.set(label, (labelCounts.get(label) || 0) + 1)
    })
})

// Sort labels by count
const topLabels = Array.from(labelCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)

// Group tools by category
const toolsByCategory = new Map<string, Tool[]>()
categories.forEach((cat) => {
    toolsByCategory.set(
        cat,
        tools.filter((t) => t.category === cat)
    )
})

// Generate llms.txt content
const content = `# dSebastien's Toolbox

> A collection of ${tools.length} free and paid productivity tools, plugins, and utilities by Sébastien Dubois.

## About
Author: Sébastien Dubois
Website: https://dsebastien.net
Main Site: https://tools.dsebastien.net
License: Various (see individual tools)

## Content Structure
- / - Homepage with searchable tools grid
- /tool/{id} - Individual tool pages with details
- /label/{name} - Label-filtered views showing related tools

## Categories
${categories
    .map((cat) => {
        const count = toolsByCategory.get(cat)?.length || 0
        return `- ${cat} (${count} tools)`
    })
    .join('\n')}

## Key Labels
${topLabels.map(([label, count]) => `- ${label} (${count} tools)`).join('\n')}

## Tools Overview

${categories
    .map((category) => {
        const categoryTools = toolsByCategory.get(category) || []
        return `### ${category}
${categoryTools
    .map(
        (tool) => `- **${tool.name}**${tool.free ? ' (Free)' : ''}: ${tool.description}
  URL: ${tool.url}`
    )
    .join('\n')}`
    })
    .join('\n\n')}

## Data Access
- Tools JSON: /src/data/tools.json

## Contact
- Author: Sébastien Dubois (https://dsebastien.net)
- GitHub: https://github.com/dsebastien
- LinkedIn: https://www.linkedin.com/in/sebastiend/
`

// Write to dist folder
const distDir = join(__dirname, '../dist')
writeFileSync(join(distDir, 'llms.txt'), content)
console.log(`✓ llms.txt generated with ${tools.length} tools`)
