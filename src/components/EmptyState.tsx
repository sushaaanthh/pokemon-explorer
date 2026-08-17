import { Link } from 'react-router-dom'; import './States.css';
export function EmptyState({ title = 'No Pokémon found.', text = 'Try searching for another Pokémon.', action }: { title?: string; text?: string; action?: boolean }) { return <section className="state"><span>◇</span><h2>{title}</h2><p>{text}</p>{action && <Link to="/" className="state__action">Explore Pokémon</Link>}</section>; }
