import { useState } from 'react'
import { Link } from 'react-router'
import { FaHeart, FaTools, FaClipboardList, FaSpinner } from 'react-icons/fa'
import resourcesData from '@/data/resources.json'
import socialsData from '@/data/socials.json'
import ToolIcon from '@/components/tools/tool-icon'
import { subscribeToNewsletter } from '@/lib/ghost-api'

// Ghost site configuration
const GHOST_SITE_URL = 'https://www.dsebastien.net'
const NEWSLETTER_SESSION_KEY = 'newsletter_subscribed'

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear()
    const [email, setEmail] = useState('')
    const [subscribeStatus, setSubscribeStatus] = useState<
        'idle' | 'loading' | 'success' | 'error'
    >('idle')
    const [errorMessage, setErrorMessage] = useState<string>('')
    // Initialize hasSubscribed from sessionStorage using lazy initializer
    const [hasSubscribed, setHasSubscribed] = useState<boolean>(() => {
        const subscribed = sessionStorage.getItem(NEWSLETTER_SESSION_KEY)
        if (subscribed === 'true') {
            console.log('[Newsletter] User has already subscribed (from sessionStorage)')
            return true
        }
        return false
    })

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return

        setSubscribeStatus('loading')
        setErrorMessage('')

        console.log('[Newsletter] Submitting subscription for:', email)

        const result = await subscribeToNewsletter(GHOST_SITE_URL, {
            email: email.trim(),
            newsletters: [] // Subscribe to all newsletters (empty = default)
        })

        console.log('[Newsletter] Subscription result:', result)

        if (result.success) {
            setSubscribeStatus('success')
            setEmail('')
            // Store subscription in sessionStorage
            sessionStorage.setItem(NEWSLETTER_SESSION_KEY, 'true')
            setHasSubscribed(true)
            console.log('[Newsletter] Subscription stored in sessionStorage')
        } else {
            setSubscribeStatus('error')
            setErrorMessage(result.error || 'Subscription failed. Please try again.')
        }
    }

    return (
        <footer className='border-primary/10 bg-background border-t'>
            {/* Newsletter Section - Hidden if user already subscribed */}
            {!hasSubscribed && (
                <div className='bg-secondary/5 border-primary/10 border-b py-12 sm:py-16'>
                    <div className='xg:px-24 mx-auto max-w-7xl px-6 sm:px-10 md:px-16 lg:px-20 xl:px-32'>
                        <div className='mx-auto max-w-2xl text-center'>
                            <h3 className='mb-2 text-2xl font-bold sm:text-3xl'>
                                Stay Updated with Knowledge Tips
                            </h3>
                            <p className='text-primary/70 mb-6 text-sm sm:text-base'>
                                Join thousands of knowledge workers getting weekly insights on PKM,
                                productivity, and lifelong learning.
                            </p>
                            {subscribeStatus === 'success' ? (
                                <div className='bg-secondary/10 border-secondary/30 rounded-lg border px-6 py-4'>
                                    <p className='text-secondary font-semibold'>
                                        ✓ Success! Please check your email to confirm your
                                        subscription.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <form
                                        onSubmit={handleNewsletterSubmit}
                                        className='mx-auto flex max-w-md flex-col gap-3 sm:flex-row'
                                    >
                                        <label htmlFor='newsletter-email' className='sr-only'>
                                            Email address for newsletter subscription
                                        </label>
                                        <input
                                            id='newsletter-email'
                                            type='email'
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder='Enter your email'
                                            required
                                            disabled={subscribeStatus === 'loading'}
                                            className='bg-primary/5 border-primary/10 text-primary placeholder:text-primary/40 focus:border-secondary/50 flex-1 rounded-lg border px-4 py-3 text-sm transition-colors outline-none disabled:opacity-50'
                                            aria-describedby='newsletter-description'
                                        />
                                        <span id='newsletter-description' className='sr-only'>
                                            Subscribe to receive updates about new tools and
                                            resources
                                        </span>
                                        <button
                                            type='submit'
                                            disabled={subscribeStatus === 'loading'}
                                            className='bg-secondary hover:bg-secondary/90 flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold whitespace-nowrap text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                                        >
                                            {subscribeStatus === 'loading' ? (
                                                <>
                                                    <FaSpinner className='h-4 w-4 animate-spin' />
                                                    Subscribing...
                                                </>
                                            ) : (
                                                'Subscribe'
                                            )}
                                        </button>
                                    </form>
                                    {subscribeStatus === 'error' && errorMessage && (
                                        <div className='mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3'>
                                            <p className='text-sm font-semibold text-red-500'>
                                                ⚠️ {errorMessage}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Footer Content */}
            <div className='xg:px-24 mx-auto max-w-7xl px-6 pt-12 pb-20 sm:px-10 sm:pt-16 sm:pb-24 md:px-16 md:pt-20 md:pb-28 lg:px-20 lg:pt-24 lg:pb-32 xl:px-32'>
                <div className='grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-3 lg:gap-16'>
                    {/* Logo and Description */}
                    <div className='flex flex-col gap-4'>
                        <Link to='/' className='flex items-center gap-3'>
                            <div className='bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                                <FaTools className='text-secondary h-5 w-5' />
                            </div>
                            <span className='text-lg font-bold'>dSebastien's Toolbox</span>
                        </Link>
                        <p className='text-primary/70 text-sm'>
                            A collection of free and paid tools, plugins, and utilities to boost
                            productivity and solve real problems.
                        </p>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className='mb-4 font-semibold'>Resources</h3>
                        <ul className='space-y-2 text-sm'>
                            {resourcesData.resources.map((resource) => (
                                <li key={resource.url}>
                                    <a
                                        href={resource.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-primary/70 hover:text-secondary flex items-center gap-2 transition-colors'
                                    >
                                        <ToolIcon icon={resource.icon} category='' size='sm' />
                                        {resource.name}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <Link
                                    to='/changelog'
                                    className='text-primary/70 hover:text-secondary flex items-center gap-2 transition-colors'
                                >
                                    <FaClipboardList className='h-4 w-4' />
                                    Changelog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h3 className='mb-4 font-semibold'>Connect</h3>
                        <div className='flex flex-wrap gap-3'>
                            {socialsData.socials.map((social) => (
                                <a
                                    key={social.url}
                                    href={social.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='transition-transform hover:scale-110'
                                    aria-label={social.name}
                                    title={social.name}
                                >
                                    <ToolIcon icon={social.icon} category='' size='md' />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='border-primary/10 text-primary/70 mt-12 border-t pt-12 text-center text-sm sm:mt-16 sm:pt-16 lg:mt-20 lg:pt-20'>
                    <p className='flex items-center justify-center gap-1'>
                        Made with <FaHeart className='text-secondary h-4 w-4' /> by{' '}
                        <a
                            href='https://www.dsebastien.net'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='hover:text-secondary transition-colors'
                        >
                            Sébastien Dubois
                        </a>
                    </p>
                    <p className='mt-2'>© {currentYear} All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
