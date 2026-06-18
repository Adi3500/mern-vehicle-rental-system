export default function StatsOverview({ stats }) {
    const accentMap = ['blue', 'gold', 'green', 'blue', 'gold'];

    return (<div className = "dashboard-grid"> {
                stats.map((stat, index) => {
                        const accent = stat.accent || accentMap[index % accentMap.length];
                        const accentColors = {
                            blue: { border: 'rgba(56,189,248,0.5)', bg: 'rgba(56,189,248,0.1)', color: 'var(--sky-300)' },
                            green: { border: 'rgba(52,211,153,0.5)', bg: 'rgba(52,211,153,0.1)', color: 'var(--jade-300)' },
                            gold: { border: 'var(--chrome-500)', bg: 'var(--gold-dim)', color: 'var(--chrome-400)' },
                            rose: { border: 'rgba(248,113,113,0.5)', bg: 'rgba(248,113,113,0.1)', color: 'var(--rose-300)' },
                        };
                        const colors = accentColors[accent] || accentColors.blue;

                        return (<div key = { index }
                                className = { `stat-card stat-card--${accent}` }
                                style = {
                                    { display: 'flex', flexDirection: 'column', gap: '0.25rem' }
                                }> {
                                    stat.icon && (<span className = "stat-card-icon"
                                        style = {
                                            {
                                                background: colors.bg,
                                                border: `1px solid ${colors.border}`,
                                                color: colors.color,
                                                marginBottom: '0.5rem',
                                            }
                                        }> { stat.icon } </span>
                                    )
                                } <div className = "stat-card-label"> { stat.label } </div><div className = "stat-card-value"> { stat.value } </div> {
                                stat.change && (<div className = { `stat-card-change ${stat.changeType === 'positive' ? 'positive' : 'negative'}` }> { stat.changeType === 'positive' ? '↑' : '↓' } { stat.change } </div>
                                )
                            } </div>
                    );
                })
        } </div>
);
}