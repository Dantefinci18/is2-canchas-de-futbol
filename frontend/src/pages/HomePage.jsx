import { Link } from 'react-router-dom';
import heroImg from '../assets/hero.png';

export default function HomePage() {
  return (
    <div className="home">
      <img src={heroImg} alt="" className="home-hero" width="170" height="179" />
      <h1>Reserva tu cancha en segundos</h1>
      <p>
        Buscá complejos de fútbol por zona, mirá los turnos libres y asegurate la cancha pagando
        una seña. Cada complejo gestiona sus propias canchas, precios y agenda.
      </p>
      <div className="acciones">
        <Link to="/buscar" className="boton">
          Buscar canchas
        </Link>
        <Link to="/registro" className="boton secundario">
          Soy dueño de un complejo
        </Link>
      </div>
    </div>
  );
}
