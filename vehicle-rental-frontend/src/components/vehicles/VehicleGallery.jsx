import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPrimaryImage } from '../../utils/format';

export default function VehicleGallery({ images = [], title }) {
    const safeImages = images.length> 0 ? images : [{ url: getPrimaryImage([]), publicId: 'fallback' }];
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        setActiveIndex(0);
    }, [images]);

    const activeImage = safeImages[activeIndex]?.url;
    const canSlide = safeImages.length> 1;

    const goToImage = (nextIndex) => {
        const total = safeImages.length;
        setActiveIndex((nextIndex + total) % total);
    };

    const navBtnStyle = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '2.5rem',
        height: '2.5rem',
        borderRadius: '50%',
        background: 'rgba(4,5,8,0.7)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
        zIndex: 2,
    };

    return (<div style = {
            { display: 'grid', gap: '0.75rem' }
        }> { /* Hero */ } <div style = {
            {
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 'var(--radius-xl)',
                aspectRatio: '16/9',
                background: 'var(--obsidian-800)',
                border: '1px solid var(--border-default)',
            }
        }><img src = { activeImage }
        alt = { title }
        style = {
            {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'opacity 0.25s',
            }
        } />

        {
            canSlide && (<><button type = "button"
                style = {
                    {...navBtnStyle, left: '0.75rem' }
                }
                onClick = {
                    () => goToImage(activeIndex - 1)
                }
                aria-label = "Previous vehicle image"
                onMouseEnter = {
                    (e) => {
                        e.currentTarget.style.background = 'rgba(4,5,8,0.9)';
                        e.currentTarget.style.borderColor = 'var(--border-medium)';
                    }
                }
                onMouseLeave = {
                    (e) => {
                        e.currentTarget.style.background = 'rgba(4,5,8,0.7)';
                        e.currentTarget.style.borderColor = 'var(--border-default)';
                    }
                }><ChevronLeft size = { 18 } /></button><button type = "button"
                style = {
                    {...navBtnStyle, right: '0.75rem' }
                }
                onClick = {
                    () => goToImage(activeIndex + 1)
                }
                aria-label = "Next vehicle image"
                onMouseEnter = {
                    (e) => {
                        e.currentTarget.style.background = 'rgba(4,5,8,0.9)';
                        e.currentTarget.style.borderColor = 'var(--border-medium)';
                    }
                }
                onMouseLeave = {
                    (e) => {
                        e.currentTarget.style.background = 'rgba(4,5,8,0.7)';
                        e.currentTarget.style.borderColor = 'var(--border-default)';
                    }
                }><ChevronRight size = { 18 } /></button>

                { /* Counter */ } <div style = {
                    {
                        position: 'absolute',
                        bottom: '0.75rem',
                        right: '0.75rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(4,5,8,0.75)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid var(--border-default)',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        letterSpacing: '0.06em',
                    }
                }> { activeIndex + 1 }
                / {safeImages.length} </div></>
            )
        } </div>

        { /* Thumbnails */ } {
            safeImages.length> 1 && (<div style = {
                    {
                        display: 'flex',
                        gap: '0.5rem',
                        overflowX: 'auto',
                        paddingBottom: '0.25rem',
                    }
                }> {
                    safeImages.map((image, index) => (<button key = { image.publicId || image.url }
                        type = "button"
                        onClick = {
                            () => setActiveIndex(index)
                        }
                        style = {
                            {
                                flexShrink: 0,
                                width: '5rem',
                                aspectRatio: '4/3',
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                border: index === activeIndex ?
                                    '2px solid var(--chrome-500)' : '2px solid var(--border-subtle)',
                                cursor: 'pointer',
                                padding: 0,
                                background: 'none',
                                transition: 'border-color 0.15s',
                                boxShadow: index === activeIndex ? 'var(--shadow-gold)' : 'none',
                            }
                        }><img src = { image.url }
                        alt = { `${title} preview ${index + 1}` }
                        style = {
                            { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
                        } /></button>
                    ))
                } </div>
            )
        }

        { /* Dots for mobile */ } {
            canSlide && (<div style = {
                    { display: 'flex', justifyContent: 'center', gap: '0.35rem' }
                }> {
                    safeImages.map((image, index) => (<button key = { `${image.publicId || image.url}-dot` }
                        type = "button"
                        onClick = {
                            () => setActiveIndex(index)
                        }
                        aria-label = { `Go to vehicle image ${index + 1}` }
                        style = {
                            {
                                width: index === activeIndex ? '1.5rem' : '0.4rem',
                                height: '0.4rem',
                                borderRadius: 'var(--radius-full)',
                                background: index === activeIndex ? 'var(--chrome-500)' : 'var(--obsidian-500)',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                transition: 'all 0.25s var(--ease-out-expo)',
                            }
                        } />
                    ))
                } </div>
            )
        } </div>
    );
}