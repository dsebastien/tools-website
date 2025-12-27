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
    category: string
    url: string
    free: boolean
    technologies: string[]
    license?: string
    sourceCodeUrl?: string
    docsUrl?: string
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

// Shared author schema for all pages
const authorSchema = {
    '@type': 'Person',
    '@id': `${BASE_URL}/#person`,
    'name': 'Sébastien Dubois',
    'givenName': 'Sébastien',
    'familyName': 'Dubois',
    'url': 'https://dsebastien.net',
    'image': 'https://www.dsebastien.net/content/images/size/w2000/2024/04/Seb-2022.jpg',
    'jobTitle': 'Knowledge Management & Productivity Mentor',
    'worksFor': {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        'name': 'DeveloPassion',
        'url': 'https://developassion.be'
    },
    'sameAs': [
        'https://www.linkedin.com/in/sebastiend/',
        'https://bsky.app/profile/dsebastien.net',
        'https://pkm.social/@dsebastien',
        'https://github.com/dsebastien',
        'https://dsebastien.medium.com/',
        'https://dev.to/dsebastien',
        'https://www.youtube.com/@dsebastien',
        'https://www.twitch.tv/dsebastien',
        'https://stackoverflow.com/users/226630/dsebastien',
        'https://dsebastien.hashnode.dev/',
        'https://www.reddit.com/user/lechtitseb/',
        'https://x.com/dSebastien'
    ]
}

const publisherSchema = {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    'name': 'DeveloPassion',
    'url': 'https://developassion.be',
    'logo': {
        '@type': 'ImageObject',
        'url': 'https://www.dsebastien.net/content/images/size/w256h256/2022/11/logo_symbol.png',
        'width': 256,
        'height': 256
    }
}

/**
 * Map tool category to Schema.org applicationCategory
 */
function mapCategory(category: string): string {
    const categoryMap: Record<string, string> = {
        'Productivity': 'ProductivityApplication',
        'AI Tools': 'UtilitiesApplication',
        'Courses': 'EducationalApplication',
        'Obsidian Plugins': 'BrowserApplication',
        'CLI Tools': 'DeveloperApplication',
        'Web Apps': 'WebApplication',
        'Templates': 'DesignApplication'
    }
    return categoryMap[category] || 'WebApplication'
}

/**
 * Generate SoftwareApplication JSON-LD schema for a tool
 */
function generateToolSchema(tool: Tool): string {
    const toolUrl = `${BASE_URL}/tool/${tool.id}`
    const today = new Date().toISOString().split('T')[0]

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'SoftwareApplication',
                '@id': `${toolUrl}#software`,
                'name': tool.name,
                'description': tool.description,
                'url': tool.url,
                'applicationCategory': mapCategory(tool.category),
                'operatingSystem': 'Web',
                'author': { '@id': `${BASE_URL}/#person` },
                'publisher': { '@id': `${BASE_URL}/#organization` },
                'provider': {
                    '@type': 'Organization',
                    'name': "dSebastien's Toolbox",
                    'url': BASE_URL
                },
                'offers': {
                    '@type': 'Offer',
                    'price': tool.free ? '0' : undefined,
                    'priceCurrency': 'USD',
                    'availability': 'https://schema.org/InStock'
                },
                'datePublished': today,
                'dateModified': today,
                'inLanguage': 'en',
                'keywords': tool.labels.join(', '),
                'isPartOf': {
                    '@type': 'WebSite',
                    '@id': `${BASE_URL}/#website`,
                    'name': "dSebastien's Toolbox",
                    'url': BASE_URL
                },
                ...(tool.license && { license: tool.license }),
                ...(tool.sourceCodeUrl && {
                    codeRepository: tool.sourceCodeUrl,
                    isAccessibleForFree: true
                }),
                ...(tool.technologies.length > 0 && {
                    runtimePlatform: tool.technologies.join(', ')
                })
            },
            authorSchema,
            publisherSchema,
            {
                '@type': 'BreadcrumbList',
                '@id': `${toolUrl}#breadcrumb`,
                'itemListElement': [
                    {
                        '@type': 'ListItem',
                        'position': 1,
                        'name': 'Home',
                        'item': BASE_URL
                    },
                    {
                        '@type': 'ListItem',
                        'position': 2,
                        'name': tool.category,
                        'item': `${BASE_URL}/?category=${encodeURIComponent(tool.category)}`
                    },
                    {
                        '@type': 'ListItem',
                        'position': 3,
                        'name': tool.name,
                        'item': toolUrl
                    }
                ]
            }
        ]
    }

    return JSON.stringify(schema, null, 12)
}

/**
 * Generate CollectionPage JSON-LD schema for a label page
 */
function generateLabelSchema(label: string, encodedLabel: string): string {
    const labelUrl = `${BASE_URL}/label/${encodedLabel}`

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': `${labelUrl}#collection`,
                'name': `${label} - dSebastien's Toolbox`,
                'description': `Tools labeled with "${label}"`,
                'url': labelUrl,
                'creator': { '@id': `${BASE_URL}/#person` },
                'publisher': { '@id': `${BASE_URL}/#organization` },
                'isPartOf': {
                    '@type': 'WebSite',
                    '@id': `${BASE_URL}/#website`,
                    'name': "dSebastien's Toolbox",
                    'url': BASE_URL
                },
                'about': {
                    '@type': 'Thing',
                    'name': label
                },
                'inLanguage': 'en'
            },
            authorSchema,
            publisherSchema,
            {
                '@type': 'BreadcrumbList',
                '@id': `${labelUrl}#breadcrumb`,
                'itemListElement': [
                    {
                        '@type': 'ListItem',
                        'position': 1,
                        'name': 'Home',
                        'item': BASE_URL
                    },
                    {
                        '@type': 'ListItem',
                        'position': 2,
                        'name': label,
                        'item': labelUrl
                    }
                ]
            }
        ]
    }

    return JSON.stringify(schema, null, 12)
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

    // Replace JSON-LD schema with SoftwareApplication schema
    const toolSchema = generateToolSchema(tool)
    html = html.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script type="application/ld+json">\n${toolSchema}\n        </script>`
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

    // Replace JSON-LD schema with CollectionPage schema
    const labelSchema = generateLabelSchema(label, encodedLabel)
    html = html.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script type="application/ld+json">\n${labelSchema}\n        </script>`
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
