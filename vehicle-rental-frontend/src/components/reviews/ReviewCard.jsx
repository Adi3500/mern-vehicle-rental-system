import { Pencil, Star, Trash2 } from 'lucide-react';
import { formatDate, getInitials } from '../../utils/format';

export default function ReviewCard({ review, canManage, onEdit, onDelete }) {
    return (<article className = "card"
        style = {
            {
                transition: 'border-color 0.2s, box-shadow 0.2s',
            }
        }
        onMouseEnter = {
            (e) => {
                e.currentTarget.style.borderColor = 'var(--border-medium)';
            }
        }
        onMouseLeave = {
            (e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
            }
        }> { /* Header: avatar + name + rating */ } <div style = {
            {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
                marginBottom: '0.875rem',
            }
        }><div style = {
            { display: 'flex', alignItems: 'center', gap: '0.75rem' }
        }> { /* Avatar */ } <div style = {
            {
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                background: 'var(--gold-dim)',
                border: '1px solid var(--border-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--chrome-400)',
            }
        }> {
            review.customer?.avatar ? (<img src = { review.customer.avatar }
                alt = { review.customer?.name }
                style = {
                    { width: '100%', height: '100%', objectFit: 'cover' }
                } />
            ) : (
                getInitials(review.customer?.name)
            )
        } </div><div><strong style = {
            {
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-primary)',
                marginBottom: '0.2rem',
            }
        }> { review.customer?.name } </strong><span style = {
            {
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
            }
        }> { formatDate(review.createdAt) } </span></div></div>

        { /* Stars */ } <div style = {
            {
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--gold-dim)',
                border: '1px solid var(--border-gold)',
            }
        }><Star size = { 12 }
        fill = "var(--chrome-400)"
        color = "var(--chrome-400)" /><span style = {
            {
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--chrome-300)',
                fontFamily: 'var(--font-mono)',
            }
        }> { review.rating } </span></div></div>

        { /* Comment */ } <p style = {
            {
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                margin: 0,
            }
        }> { review.comment } </p>

        { /* Actions */ } {
            canManage ? (<div style = {
                    {
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '1rem',
                        paddingTop: '0.875rem',
                        borderTop: '1px solid var(--border-subtle)',
                    }
                }><button type = "button"
                className = "button button--ghost button--sm"
                onClick = {
                    () => onEdit(review)
                }><Pencil size = { 13 } />
                Edit </button><button type = "button"
                className = "button button--danger button--sm"
                onClick = {
                    () => onDelete(review)
                }><Trash2 size = { 13 } />
                Delete </button></div>
            ) : null
        } </article>
    );
}