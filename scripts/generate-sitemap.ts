#!/usr/bin/env tsx
/**
 * Generates a sitemap.xml for the tools website.
 * Includes the homepage and all tool detail pages.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
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
    featured: boolean
    status: string
    license?: string
    sourceCodeUrl?: string
    docsUrl?: string
    coverImage?: string
    icon?: string
}

interface ToolsData {
    tools: Tool[]
    categories: string[]
    statuses: Record<string, { label: string; color: string; description: string }>
}

interface SitemapUrl {
    loc: string
    lastmod: string
    changefreq: string
    priority: string
}

// Read tools data
const toolsJsonPath = join(__dirname, '../src/data/tools.json')
const toolsData: ToolsData = JSON.parse(readFileSync(toolsJsonPath, 'utf-8'))

// Get current date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0]

// Generate sitemap XML
function generateSitemap(): string {
    const urls: SitemapUrl[] = []

    // Add homepage
    urls.push({
        loc: BASE_URL,
        lastmod: today,
        changefreq: 'weekly',
        priority: '1.0'
    })

    // Add each tool page
    for (const tool of toolsData.tools) {
        urls.push({
            loc: `${BASE_URL}/#/tool/${tool.id}`,
            lastmod: today,
            changefreq: 'monthly',
            priority: '0.8'
        })
    }

    // Build XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('\n')}
</urlset>
`

    return xml
}

// Write sitemap to dist folder
function writeSitemap(): void {
    const distDir = join(__dirname, '../dist')

    // Create dist directory if it doesn't exist
    if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true })
    }

    const sitemapPath = join(distDir, 'sitemap.xml')
    const sitemap = generateSitemap()

    writeFileSync(sitemapPath, sitemap)
    console.log(`✓ Sitemap generated: ${sitemapPath}`)
    console.log(`  - Homepage: 1 URL`)
    console.log(`  - Tools: ${toolsData.tools.length} URLs`)
    console.log(`  - Total: ${toolsData.tools.length + 1} URLs`)
}

writeSitemap()
