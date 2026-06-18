export default function DashboardHeader({ title, subtitle, children }) {
    return (<div className = "page-header"
        style = {
            {
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '1.5rem',
                flexWrap: 'wrap',
            }
        }><div><h1 style = {
            { marginBottom: subtitle ? '0.4rem' : 0 }
        }> { title } </h1> {
        subtitle && <p> { subtitle } </p>} </div> {
            children && (<div style = {
                    { display: 'flex', gap: '0.6rem', flexWrap: 'wrap', flexShrink: 0 }
                }> { children } </div>
            )
        } </div>
    );
}