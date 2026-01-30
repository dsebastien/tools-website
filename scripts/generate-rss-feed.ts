#!/usr/bin/env bun
/**
 * Generates an RSS feed (feed.xml) for the tools website.
 * Includes all tools sorted alphabetically.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://tools.dsebastien.net'
const FEED_TITLE = "dSebastien's Toolbox"
const FEED_DESCRIPTION =
    'A collection of free and paid productivity tools, plugins, and utilities by Sébastien Dubois.'
const FEED_LANGUAGE = 'en-us'
const FEED_AUTHOR = 'Sébastien Dubois'
const FEED_EMAIL = 'sebastien@dsebastien.net'

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

// Sort tools alphabetically by name
const sortedTools = [...tools].sort((a, b) => a.name.localeCompare(b.name))

// Escape XML special characters
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

// Generate RSS feed XML
function generateRssFeed(): string {
    const now = new Date().toUTCString()

    const items = sortedTools
        .map((tool) => {
            const link = `${BASE_URL}/tool/${tool.id}`
            const freeTag = tool.free ? ' (Free)' : ''
            const categories = [tool.category, ...tool.labels]
                .filter(Boolean)
                .map((cat) => `    <category>${escapeXml(cat)}</category>`)
                .join('\n')

            return `  <item>
    <title>${escapeXml(tool.name)}${freeTag}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <pubDate>${now}</pubDate>
    <description>${escapeXml(tool.description)}</description>
${categories}
  </item>`
        })
        .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>${FEED_LANGUAGE}</language>
    <lastBuildDate>${now}</lastBuildDate>
    <managingEditor>${FEED_EMAIL} (${FEED_AUTHOR})</managingEditor>
    <webMaster>${FEED_EMAIL} (${FEED_AUTHOR})</webMaster>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/assets/images/icon.svg</url>
      <title>${escapeXml(FEED_TITLE)}</title>
      <link>${BASE_URL}</link>
    </image>
${items}
  </channel>
</rss>
`
}

// Write RSS feed to dist folder
function writeRssFeed(): void {
    const distDir = join(__dirname, '../dist')

    // Create dist directory if it doesn't exist
    if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true })
    }

    const feedPath = join(distDir, 'feed.xml')
    const feed = generateRssFeed()

    writeFileSync(feedPath, feed)
    console.log(`✓ RSS feed generated: ${feedPath}`)
    console.log(`  - Total tools: ${tools.length}`)
}

writeRssFeed()
