import { useState } from 'react';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import Modal from '../common/Modal';

export default function VehicleFilters({
    filters,
    categories,
    onChange,
    onInstantChange,   // fires apply immediately (category, clear)
    onApply,
    onReset,
    compact = false,
}) {
    const [menuOpen, setMenuOpen] = useState(false);

    const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
        if (key === 'search' || key === 'category') return count; // shown inline
        if (key === 'sort') return value && value !== '-createdAt' ? count + 1 : count;
        return value ? count + 1 : count;
    }, 0);

    const handleModalSubmit = (event) => {
        onApply(event);
        setMenuOpen(false);
    };

    const handleReset = () => {
        onReset();
        setMenuOpen(false);
    };

    const selectedCategory = categories.find(c => c._id === filters.category);

    const fieldStyle = { display: 'grid', gap: '0.4rem' };
    const labelStyle = {
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text-muted)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
    };

    return (
        <>
            <form
                className="vf-bar card"
                onSubmit={onApply}
            >
                {/* ── Category pill dropdown ── */}
                <div className="vf-bar__segment vf-bar__segment--category">
                    <span className="vf-bar__label">Category</span>
                    <div className="vf-bar__category-wrap">
                        <select
                            className="vf-bar__category-select"
                            value={filters.category}
                            onChange={(e) => onInstantChange('category', e.target.value)}
                            aria-label="Filter by category"
                        >
                            <option value="">All types</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={13} className="vf-bar__category-chevron" />
                    </div>
                </div>

                <div className="vf-bar__divider" />

                {/* ── Title search input ── */}
                <div className="vf-bar__segment vf-bar__segment--search">
                    <span className="vf-bar__label">Search</span>
                    <div className="vf-bar__input-wrap">
                        <Search size={14} className="vf-bar__search-icon" />
                        <input
                            className="vf-bar__input"
                            value={filters.search}
                            onChange={(e) => onChange('search', e.target.value)}
                            placeholder="Search by vehicle title…"
                            aria-label="Search vehicles by title"
                        />
                        {filters.search && (
                            <button
                                type="button"
                                className="vf-bar__clear"
                                onClick={() => onInstantChange('search', '')}
                                aria-label="Clear search"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="vf-bar__divider" />

                {/* ── Actions ── */}
                <div className="vf-bar__actions">
                    <button
                        type="button"
                        className="vf-bar__filter-btn"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open advanced filters"
                    >
                        <SlidersHorizontal size={14} />
                        <span>Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="vf-bar__badge">{activeFilterCount}</span>
                        )}
                    </button>
                </div>
            </form>

            {/* Active category chip (shown below bar when a category is selected) */}
            {selectedCategory && (
                <div className="vf-chips">
                    <span className="vf-chip">
                        {selectedCategory.name}
                        <button
                            type="button"
                            className="vf-chip__remove"
                            onClick={() => onInstantChange('category', '')}
                            aria-label={`Remove ${selectedCategory.name} filter`}
                        >
                            <X size={11} />
                        </button>
                    </span>
                </div>
            )}

            {/* ── Advanced filter modal ── */}
            <Modal
                open={menuOpen}
                title="Filter Vehicles"
                onClose={() => setMenuOpen(false)}
                actions={
                    <>
                        <button type="button" className="button button--ghost" onClick={handleReset}>
                            Reset all
                        </button>
                        <button type="submit" form="vehicle-filter-menu" className="button button--primary">
                            Apply filters
                        </button>
                    </>
                }
            >
                <form
                    id="vehicle-filter-menu"
                    onSubmit={handleModalSubmit}
                    style={{ display: 'grid', gap: '1rem' }}
                >
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '1rem',
                    }}>
                        {/* City */}
                        <label style={fieldStyle}>
                            <span style={labelStyle}>City</span>
                            <input
                                className="form-control"
                                value={filters.city}
                                onChange={(e) => onChange('city', e.target.value)}
                                placeholder="Search by city"
                            />
                        </label>

                        {/* Category (also inside modal for consistency) */}
                        <label style={fieldStyle}>
                            <span style={labelStyle}>Category</span>
                            <select
                                className="form-control"
                                value={filters.category}
                                onChange={(e) => onChange('category', e.target.value)}
                            >
                                <option value="">All categories</option>
                                {categories.map((c) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </label>

                        {/* Min price */}
                        <label style={fieldStyle}>
                            <span style={labelStyle}>Min price</span>
                            <input
                                type="number" min="0"
                                className="form-control"
                                value={filters.minPrice}
                                onChange={(e) => onChange('minPrice', e.target.value)}
                                placeholder="0"
                            />
                        </label>

                        {/* Max price */}
                        <label style={fieldStyle}>
                            <span style={labelStyle}>Max price</span>
                            <input
                                type="number" min="0"
                                className="form-control"
                                value={filters.maxPrice}
                                onChange={(e) => onChange('maxPrice', e.target.value)}
                                placeholder="500"
                            />
                        </label>

                        {/* Transmission */}
                        <label style={fieldStyle}>
                            <span style={labelStyle}>Transmission</span>
                            <select
                                className="form-control"
                                value={filters.transmission}
                                onChange={(e) => onChange('transmission', e.target.value)}
                            >
                                <option value="">Any</option>
                                <option value="automatic">Automatic</option>
                                <option value="manual">Manual</option>
                            </select>
                        </label>

                        {/* Fuel type */}
                        <label style={fieldStyle}>
                            <span style={labelStyle}>Fuel type</span>
                            <select
                                className="form-control"
                                value={filters.fuelType}
                                onChange={(e) => onChange('fuelType', e.target.value)}
                            >
                                <option value="">Any</option>
                                <option value="petrol">Petrol</option>
                                <option value="diesel">Diesel</option>
                                <option value="electric">Electric</option>
                                <option value="hybrid">Hybrid</option>
                                <option value="cng">CNG</option>
                            </select>
                        </label>

                        {/* Sort */}
                        <label style={fieldStyle}>
                            <span style={labelStyle}>Sort by</span>
                            <select
                                className="form-control"
                                value={filters.sort}
                                onChange={(e) => onChange('sort', e.target.value)}
                            >
                                <option value="-createdAt">Newest</option>
                                <option value="pricePerDay">Price: low to high</option>
                                <option value="-pricePerDay">Price: high to low</option>
                                <option value="-averageRating">Top rated</option>
                            </select>
                        </label>
                    </div>
                </form>
            </Modal>
        </>
    );
}