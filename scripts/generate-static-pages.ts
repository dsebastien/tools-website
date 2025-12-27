#!/usr/bin/env tsx
/**
 * Generates static HTML pages for all routes.
 * This creates a directory structure with index.html files for each route,
 * enabling direct URL access on static hosting like GitHub Pages.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://tools.dsebastien.net'

interface Tool {
    id: string
    name: string
    description: string
    labels: string[]
}

interface ToolsData {
    tools: Tool[]
}

// Load tools data
const toolsJsonPath = join(__dirname, '../src/data/tools.json')
const toolsData: ToolsData = JSON.parse(readFileSync(toolsJsonPath, 'utf-8'))

// Extract all unique labels
const allLabels = Array.from(new Set(toolsData.tools.flatMap((tool) => tool.labels))).sort()

const distDir = join(__dirname, '../dist')

// Read the built index.html
const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf-8')

/**
 * Escape HTML special characters to prevent XSS and broken HTML
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

/**
 * Generate customized HTML for a tool page with appropriate meta tags
 */
function generateToolPageHtml(tool: Tool): string {
    const toolUrl = `${BASE_URL}/tool/${tool.id}`
    const title = `${tool.name} - dSebastien's Toolbox`
    const description = tool.description

    let html = indexHtml

    // Update <title>
    html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)

    // Update canonical URL
    html = html.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
        `<link rel="canonical" href="${toolUrl}" />`
    )

    // Update meta description
    html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${escapeHtml(description)}" />`
    )

    // Update Open Graph tags
    html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:url" content="${toolUrl}" />`
    )
    html = html.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:description" content="${escapeHtml(description)}" />`
    )

    // Update Twitter tags
    html = html.replace(
        /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:url" content="${toolUrl}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    )

    return html
}

/**
 * Generate customized HTML for a label page with appropriate meta tags
 */
function generateLabelPageHtml(label: string, encodedLabel: string): string {
    const labelUrl = `${BASE_URL}/label/${encodedLabel}`
    const title = `${label} - dSebastien's Toolbox`
    const description = `Tools labeled with "${label}"`

    let html = indexHtml

    // Update <title>
    html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)

    // Update canonical URL
    html = html.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
        `<link rel="canonical" href="${labelUrl}" />`
    )

    // Update meta description
    html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${escapeHtml(description)}" />`
    )

    // Update Open Graph tags
    html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:url" content="${labelUrl}" />`
    )
    html = html.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:description" content="${escapeHtml(description)}" />`
    )

    // Update Twitter tags
    html = html.replace(
        /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:url" content="${labelUrl}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    )

    return html
}

// Create directories and generate customized HTML for each tool
console.log('Generating static pages for tools...')
let toolCount = 0
for (const tool of toolsData.tools) {
    const toolDir = join(distDir, 'tool', tool.id)
    mkdirSync(toolDir, { recursive: true })
    const toolHtml = generateToolPageHtml(tool)
    writeFileSync(join(toolDir, 'index.html'), toolHtml)
    toolCount++
}
console.log(`  ✓ Created ${toolCount} tool pages`)

// Create directories and generate customized HTML for each label
console.log('Generating static pages for labels...')
let labelCount = 0
for (const label of allLabels) {
    // URL-encode the label for the directory name
    const encodedLabel = encodeURIComponent(label)
    const labelDir = join(distDir, 'label', encodedLabel)
    mkdirSync(labelDir, { recursive: true })

    // Generate customized HTML with label-specific meta tags
    const labelHtml = generateLabelPageHtml(label, encodedLabel)
    writeFileSync(join(labelDir, 'index.html'), labelHtml)
    labelCount++
}
console.log(`  ✓ Created ${labelCount} label pages`)

// Create 404.html for GitHub Pages fallback (copy of index.html)
writeFileSync(join(distDir, '404.html'), indexHtml)
console.log('  ✓ Created 404.html fallback')

console.log(`\n✓ Static pages generated: ${toolCount + labelCount + 2} total`)
console.log(`  - Homepage: 1`)
console.log(`  - Tools: ${toolCount}`)
console.log(`  - Labels: ${labelCount}`)
console.log(`  - 404 fallback: 1`)
