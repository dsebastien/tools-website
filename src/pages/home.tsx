import { useState, useEffect, useMemo } from 'react'
import { FaGithub, FaLinkedin, FaRocket, FaYoutube, FaEnvelope } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import Section from '@/components/ui/section'
import ToolCard from '@/components/tools/tool-card'
import ToolsFilter from '@/components/tools/tools-filter'
import ToolDetailModal from '@/components/tools/tool-detail-modal'
import CommandPalette from '@/components/tools/command-palette'
import toolsData from '@/data/tools.json'
import type { Tool, ToolStatus, ToolsData } from '@/types/tool'

const typedToolsData = toolsData as ToolsData

const HomePage: React.FC = () => {
    // Filter state
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [selectedLabels, setSelectedLabels] = useState<string[]>([])
    const [selectedStatuses, setSelectedStatuses] = useState<ToolStatus[]>([])
    const [showFreeOnly, setShowFreeOnly] = useState(false)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Modal state
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

    // Get all unique labels from tools
    const allLabels = useMemo(() => {
        const labels = new Set<string>()
        typedToolsData.tools.forEach((tool) => {
            tool.labels.forEach((label) => labels.add(label))
        })
        return Array.from(labels).sort()
    }, [])

    // Filter tools
    const filteredTools = useMemo(() => {
        return typedToolsData.tools.filter((tool) => {
            // Search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                const matchesSearch =
                    tool.name.toLowerCase().includes(query) ||
                    tool.description.toLowerCase().includes(query) ||
                    tool.labels.some((l) => l.toLowerCase().includes(query)) ||
                    tool.technologies.some((t) => t.toLowerCase().includes(query))
                if (!matchesSearch) return false
            }

            // Category filter
            if (selectedCategory !== 'All' && tool.category !== selectedCategory) {
                return false
            }

            // Labels filter
            if (
                selectedLabels.length > 0 &&
                !selectedLabels.some((label) => tool.labels.includes(label))
            ) {
                return false
            }

            // Status filter
            if (selectedStatuses.length > 0 && !selectedStatuses.includes(tool.status)) {
                return false
            }

            // Free only filter
            if (showFreeOnly && !tool.free) {
                return false
            }

            return true
        })
    }, [searchQuery, selectedCategory, selectedLabels, selectedStatuses, showFreeOnly])

    // Sort: featured first, then by name
    const sortedTools = useMemo(() => {
        return [...filteredTools].sort((a, b) => {
            if (a.featured && !b.featured) return -1
            if (!a.featured && b.featured) return 1
            return a.name.localeCompare(b.name)
        })
    }, [filteredTools])

    // Handle keyboard shortcut for command palette
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Open command palette with '/' key (unless in input)
            if (
                e.key === '/' &&
                !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
            ) {
                e.preventDefault()
                setIsCommandPaletteOpen(true)
            }

            // Also support Cmd/Ctrl + K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsCommandPaletteOpen(true)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleShowDetails = (tool: Tool) => {
        setSelectedTool(tool)
        setIsDetailModalOpen(true)
    }

    const handleCloseDetails = () => {
        setIsDetailModalOpen(false)
        setSelectedTool(null)
    }

    // Stats
    const totalTools = typedToolsData.tools.length
    const freeTools = typedToolsData.tools.filter((t) => t.free).length
    const activeTools = typedToolsData.tools.filter((t) => t.status === 'active').length

    return (
        <>
            {/* Hero Section */}
            <Section className='pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20'>
                <div className='mx-auto max-w-4xl text-center'>
                    <h1 className='mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl'>
                        Tools by{' '}
                        <a
                            href='https://www.dsebastien.net'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary hover:text-secondary transition-colors'
                        >
                            dSebastien
                        </a>
                    </h1>
                    <p className='text-primary/70 mx-auto mb-8 max-w-2xl text-lg sm:text-xl md:text-2xl'>
                        A collection of free and paid tools, plugins, and utilities I've created to
                        boost productivity and solve real problems.
                    </p>

                    {/* Stats */}
                    <div className='mb-10 flex flex-wrap justify-center gap-6 sm:gap-10'>
                        <div className='text-center'>
                            <div className='text-secondary text-3xl font-bold sm:text-4xl'>
                                {totalTools}
                            </div>
                            <div className='text-primary/60 text-sm'>Total Tools</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-green-400 sm:text-4xl'>
                                {freeTools}
                            </div>
                            <div className='text-primary/60 text-sm'>Free & Open Source</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-blue-400 sm:text-4xl'>
                                {activeTools}
                            </div>
                            <div className='text-primary/60 text-sm'>Actively Maintained</div>
                        </div>
                    </div>

                    {/* Quick tip */}
                    <div className='bg-secondary/10 border-secondary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm'>
                        <FaRocket className='text-secondary h-4 w-4' />
                        <span className='text-primary/70'>
                            Press{' '}
                            <kbd className='bg-secondary/20 mx-1 rounded px-1.5 py-0.5 font-mono text-xs'>
                                /
                            </kbd>{' '}
                            to quickly search and navigate
                        </span>
                    </div>
                </div>
            </Section>

            {/* Tools Section */}
            <Section className='py-8 sm:py-12'>
                {/* Filters */}
                <div className='mb-8'>
                    <ToolsFilter
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        selectedLabels={selectedLabels}
                        onLabelsChange={setSelectedLabels}
                        selectedStatuses={selectedStatuses}
                        onStatusesChange={setSelectedStatuses}
                        showFreeOnly={showFreeOnly}
                        onShowFreeOnlyChange={setShowFreeOnly}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        categories={typedToolsData.categories}
                        allLabels={allLabels}
                        statuses={typedToolsData.statuses}
                        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                    />
                </div>

                {/* Results count */}
                <div className='text-primary/60 mb-6 text-sm'>
                    Showing {sortedTools.length} of {totalTools} tools
                    {searchQuery && ` matching "${searchQuery}"`}
                </div>

                {/* Tools Grid/List */}
                {sortedTools.length > 0 ? (
                    <div
                        className={
                            viewMode === 'grid'
                                ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                                : 'flex flex-col gap-3'
                        }
                    >
                        {sortedTools.map((tool) => (
                            <ToolCard
                                key={tool.id}
                                tool={tool}
                                statuses={typedToolsData.statuses}
                                onShowDetails={handleShowDetails}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                ) : (
                    <div className='py-16 text-center'>
                        <div className='mb-4 text-5xl'>🔍</div>
                        <h3 className='mb-2 text-xl font-semibold'>No tools found</h3>
                        <p className='text-primary/60'>
                            Try adjusting your search or filters to find what you're looking for.
                        </p>
                    </div>
                )}
            </Section>

            {/* About Section */}
            <Section className='border-primary/10 border-t py-16 sm:py-20'>
                <div className='mx-auto max-w-3xl text-center'>
                    <h2 className='mb-6 text-2xl font-bold sm:text-3xl'>About the Creator</h2>
                    <div className='mb-6 flex justify-center'>
                        <img
                            src='/assets/images/2025-11-03-Seb.png'
                            alt='Sébastien Dubois'
                            className='border-secondary/30 h-24 w-24 rounded-full border-2 object-cover sm:h-32 sm:w-32'
                        />
                    </div>
                    <p className='text-primary/70 mb-6 leading-relaxed'>
                        Hi! I'm Sébastien Dubois, a software crafter with 20+ years of IT
                        experience. I love building tools that solve real problems and boost
                        productivity. Most of my tools are open source and free to use. Some are
                        paid products that help support my work.
                    </p>
                    {/* Primary links */}
                    <div className='mb-4 flex flex-wrap justify-center gap-3'>
                        <a
                            href='https://www.dsebastien.net'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='bg-secondary hover:bg-secondary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors'
                        >
                            <img
                                src='https://www.dsebastien.net/assets/images/developassion-logo.png?v=227ae60558'
                                alt='DeveloPassion'
                                className='h-5 w-5 rounded-full object-contain'
                            />
                            Website
                        </a>
                        <a
                            href='https://www.youtube.com/@dsebastien'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-red-400 transition-colors hover:bg-red-500/30'
                        >
                            <FaYoutube className='h-5 w-5' />
                            YouTube
                        </a>
                        <a
                            href='https://www.dsebastien.net/newsletter/'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-2 rounded-lg bg-amber-500/20 px-4 py-2 text-amber-400 transition-colors hover:bg-amber-500/30'
                        >
                            <FaEnvelope className='h-5 w-5' />
                            Newsletter
                        </a>
                    </div>
                    {/* Social links */}
                    <div className='flex flex-wrap justify-center gap-3'>
                        <a
                            href='https://github.com/dsebastien'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='bg-primary/10 hover:bg-primary/20 flex items-center gap-2 rounded-lg px-4 py-2 transition-colors'
                        >
                            <FaGithub className='h-5 w-5' />
                            GitHub
                        </a>
                        <a
                            href='https://x.com/dsebastien'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='bg-primary/10 hover:bg-primary/20 flex items-center gap-2 rounded-lg px-4 py-2 transition-colors'
                        >
                            <FaXTwitter className='h-5 w-5' />X
                        </a>
                        <a
                            href='https://www.linkedin.com/in/sebastiend'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='bg-primary/10 hover:bg-primary/20 flex items-center gap-2 rounded-lg px-4 py-2 transition-colors'
                        >
                            <FaLinkedin className='h-5 w-5' />
                            LinkedIn
                        </a>
                    </div>
                </div>
            </Section>

            {/* Detail Modal */}
            <ToolDetailModal
                tool={selectedTool}
                statuses={typedToolsData.statuses}
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetails}
            />

            {/* Command Palette */}
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                tools={typedToolsData.tools}
                onShowDetails={handleShowDetails}
                onSetViewMode={setViewMode}
                onSetCategory={setSelectedCategory}
                categories={typedToolsData.categories}
            />
        </>
    )
}

export default HomePage
