import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Car,
    CheckCircle,
    Clock,
    MapPin,
    Shield,
    Star,
    Zap,
} from 'lucide-react';
import { categoryApi, vehicleApi } from '../../api/endpoints';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import SkeletonCard from '../../components/common/SkeletonCard';
import VehicleFilters from '../../components/vehicles/VehicleFilters';
import VehicleCard from '../../components/vehicles/VehicleCard';
import { getApiError } from '../../utils/format';

/* ── Constants ───────────────────────────── */

const defaultFilters = {
    search: '',
    city: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    transmission: '',
    fuelType: '',
    sort: '-createdAt',
};

const sanitize = (f) =>
    Object.fromEntries(
        Object.entries(f)
            .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
            .filter(([, v]) => v !== '' && v !== null && v !== undefined),
    );

const STATS = [
    { value: '500+', label: 'Vehicles listed', icon: <Car size={18} /> },
    { value: '4.9★', label: 'Average rating', icon: <Star size={18} /> },
    { value: '24h', label: 'Support available', icon: <Clock size={18} /> },
    { value: '100%', label: 'Verified hosts', icon: <CheckCircle size={18} /> },
];

const FEATURES = [
    {
        icon: <Zap size={22} />,
        title: 'Instant Booking',
        description:
            'Skip the wait. Confirm your vehicle in seconds with real-time availability and transparent pricing.',
    },
    {
        icon: <Shield size={22} />,
        title: 'Verified & Safe',
        description:
            'Every host and vehicle is reviewed before going live. Book with complete peace of mind.',
    },
    {
        icon: <Star size={22} />,
        title: 'Premium Fleet',
        description:
            'From compact city cars to luxury SUVs — curated vehicles that match any occasion or budget.',
    },
    {
        icon: <MapPin size={22} />,
        title: 'Nationwide Coverage',
        description:
            'Thousands of pickup locations across the country with flexible drop-off options.',
    },
];

/* ── Page ─────────────────────────────────── */

export default function HomePage() {
    const [filters, setFilters] = useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
    const [vehicles, setVehicles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const catalogRef = useRef(null);

    useEffect(() => {
        categoryApi.list()
            .then((r) => setCategories(r.data?.data?.categories || []))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const r = await vehicleApi.list({ ...sanitize(appliedFilters), page, limit: 9 });
                setVehicles(r.data?.data || []);
                setPagination(r.data?.pagination || null);
            } catch (e) {
                setError(getApiError(e, 'Could not load vehicles right now.'));
                setVehicles([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [appliedFilters, page]);

    const handleFilterChange = (key, value) =>
        setFilters((p) => ({ ...p, [key]: value }));

    // Instant apply — used by category select & clear-X button
    const handleInstantChange = (key, value) => {
        setFilters((p) => ({ ...p, [key]: value }));
        setAppliedFilters((p) => ({ ...p, [key]: value }));
        setPage(1);
    };

    // Debounced auto-search while user types in the title field (400 ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setAppliedFilters((p) => ({ ...p, search: filters.search }));
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [filters.search]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleApply = (e) => {
        e.preventDefault();
        setPage(1);
        setAppliedFilters(filters);
    };

    const handleReset = () => {
        setFilters(defaultFilters);
        setAppliedFilters(defaultFilters);
        setPage(1);
    };

    const scrollToCatalog = () =>
        catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    return (
        <div className="home-page">

            {/* ═══════════════════════════════════════════
                HERO
            ═══════════════════════════════════════════ */}
            <section className="hp-hero" style={{ backgroundImage: "url('/hero_car_bg.png')" }}>
                {/* Overlays */}
                <div className="hp-hero__overlay" />
                <div className="hp-hero__overlay hp-hero__overlay--gradient" />

                {/* Decorative rings */}
                <div className="hp-hero__ring hp-hero__ring--1" />
                <div className="hp-hero__ring hp-hero__ring--2" />

                <div className="hp-hero__content">
                    {/* Eyebrow */}
                    <div className="hp-hero__eyebrow">
                        <span className="hp-hero__dot" />
                        Premium Vehicle Rental
                    </div>

                    <h1 className="hp-hero__title">
                        Find Your<br />
                        Perfect <em>Ride</em>
                    </h1>

                    <p className="hp-hero__sub">
                        Browse 500+ verified vehicles. Real-time availability,
                        transparent pricing, instant booking — all in one place.
                    </p>

                    <div className="hp-hero__actions">
                        <button
                            type="button"
                            className="hp-btn hp-btn--primary"
                            onClick={scrollToCatalog}
                        >
                            Browse Vehicles
                            <ArrowRight size={16} />
                        </button>
                        <Link to="/register" className="hp-btn hp-btn--ghost">
                            Get started free
                        </Link>
                    </div>

                    {/* Trust badges */}
                    <div className="hp-hero__badges">
                        {[
                            { dot: true, label: 'Instant booking' },
                            { label: '500+ vehicles' },
                            { label: 'No hidden fees' },
                        ].map((b) => (
                            <span key={b.label} className="hp-hero__badge">
                                {b.dot && <span className="hp-hero__badge-dot" />}
                                {b.label}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                STATS BAR
            ═══════════════════════════════════════════ */}
            <section className="hp-stats">
                {STATS.map((s) => (
                    <div key={s.label} className="hp-stats__item">
                        <span className="hp-stats__icon">{s.icon}</span>
                        <div>
                            <strong className="hp-stats__value">{s.value}</strong>
                            <span className="hp-stats__label">{s.label}</span>
                        </div>
                    </div>
                ))}
            </section>

            {/* ═══════════════════════════════════════════
                WHY DRIVE — FEATURES
            ═══════════════════════════════════════════ */}
            <section className="hp-features">
                <div className="hp-section-header">
                    <div className="hp-eyebrow">Why DRIVE</div>
                    <h2 className="hp-section-title">Everything you need,<br />nothing you don't</h2>
                    <p className="hp-section-sub">
                        A rental experience built around clarity, quality, and speed.
                    </p>
                </div>
                <div className="hp-features__grid">
                    {FEATURES.map((f) => (
                        <div key={f.title} className="hp-feature-card">
                            <span className="hp-feature-card__icon">{f.icon}</span>
                            <h3 className="hp-feature-card__title">{f.title}</h3>
                            <p className="hp-feature-card__desc">{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                VEHICLE CATALOG
            ═══════════════════════════════════════════ */}
            <section className="hp-catalog" id="vehicle-results" ref={catalogRef}>
                <div className="hp-section-header">
                    <div className="hp-eyebrow">Live Catalog</div>
                    <h2 className="hp-section-title">Available Vehicles</h2>
                    <p className="hp-section-sub">
                        Search, filter, and book from our verified fleet — updated in real time.
                    </p>
                </div>

                <VehicleFilters
                    filters={filters}
                    categories={categories}
                    onChange={handleFilterChange}
                    onInstantChange={handleInstantChange}
                    onApply={handleApply}
                    onReset={handleReset}
                />

                {error && (
                    <ErrorState
                        title="Vehicle catalog unavailable"
                        description={error}
                        action={
                            <button
                                type="button"
                                className="button button--ghost"
                                onClick={() => setAppliedFilters({ ...appliedFilters })}
                            >
                                Retry
                            </button>
                        }
                    />
                )}

                {loading ? (
                    <div className="hp-grid">
                        {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : vehicles.length === 0 ? (
                    <EmptyState
                        icon="🚗"
                        title="No vehicles match these filters"
                        description="Try widening your price range or searching another city."
                        action={
                            <button type="button" className="button button--ghost" onClick={handleReset}>
                                Clear all filters
                            </button>
                        }
                    />
                ) : (
                    <>
                        <div className="hp-grid">
                            {vehicles.map((v) => <VehicleCard key={v._id} vehicle={v} />)}
                        </div>
                        <Pagination pagination={pagination} onPageChange={setPage} />
                    </>
                )}

                {!loading && vehicles.length > 0 && (
                    <p className="hp-live-tag">
                        Showing live results from your backend API
                    </p>
                )}
            </section>

            {/* ═══════════════════════════════════════════
                BOTTOM CTA BANNER
            ═══════════════════════════════════════════ */}
            <section className="hp-cta">
                <div className="hp-cta__inner">
                    <div className="hp-cta__text">
                        <h2>Ready to hit the road?</h2>
                        <p>Sign up free and start booking your perfect vehicle today.</p>
                    </div>
                    <div className="hp-cta__actions">
                        <Link to="/register" className="hp-btn hp-btn--primary">
                            Create free account
                            <ArrowRight size={15} />
                        </Link>
                        <button
                            type="button"
                            className="hp-btn hp-btn--ghost"
                            onClick={scrollToCatalog}
                        >
                            Browse first
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}