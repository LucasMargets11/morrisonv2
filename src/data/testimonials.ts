export type Testimonial = {
  id: number;
  name: string;
  location: string;   // Barrio, CABA
  service: string;    // Alquiler Temporal | Administración | etc.
  rating: number;     // 1..5
  text: string;
  avatar: string;
  date: string;       // Mes Año
};

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Macarena Diaz',
    location: 'Recoleta, CABA',
    service: 'Alquiler Temporal',
    rating: 5,
    text: 'Excelente servicio por parte de Grupo Bairen, sin duda volvería a hospedarme con ellos. ¡Ha sido una hermosa experiencia! Gracias.',
    avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjXYC4GERLqDzhmttQh0pmRnpG5EUEpzlVBNpQ0QuBp-8ECYzMU=w72-h72-p-rp-mo-br100',
    date: 'Mayo 2025', // hace 4 meses desde sep-2025
  },
  {
    id: 2,
    name: 'Fede Hormigo',
    location: 'Belgrano, CABA',
    service: 'Administración',
    rating: 5,
    text: 'Excelente atención del equipo de Bairen, muy profesionales y confiables. Se encargan de todos los problemas que conlleva tener un inmueble en alquiler; dejé mi inversión en muy buenas manos.',
    avatar: 'https://lh3.googleusercontent.com/a/ACg8ocJ4ASbXmX-ajGYe5TgUtqWyOcXK1SkSjCuR3PmZKYjIaAVO9Q=w72-h72-p-rp-mo-br100',
    date: 'Abril 2025', // hace 5 meses
  },
  {
    id: 3,
    name: 'Cristian Marucci',
    location: 'Palermo, CABA',
    service: 'Alquiler Temporal',
    rating: 4,
    text: 'Excelente atención y alojamientos. Todo el equipo es muy amable y presto a resolver lo que sea necesario.',
    avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjXaWyVNhGovu-VzCwmVeIcby-gXqIhAbUXQOLWy9-C3UdokXLz9tw=w72-h72-p-rp-mo-ba4-br100',
    date: 'Septiembre 2025', // hace 2 semanas
  },
  {
    id: 4,
    name: 'Franco Piloto Martinez',
    location: 'Microcentro, CABA',
    service: 'Administración',
    rating: 5,
    text: 'La verdad, un placer. Me desligué completamente: Bairen resuelve, te entrega resultados y sigue. Y ante todo cuidan la propiedad, que al final del día es clave mantenerla a pesar del paso del tiempo.',
    avatar: 'https://lh3.googleusercontent.com/a/ACg8ocKgZ6ry-x6YD5A4eOBnIoLGrkpWb-4PekCEPQdCNeuZrvg3lw=w72-h72-p-rp-mo-br100',
    date: 'Marzo 2025', // hace 6 meses
  },
  {
    id: 5,
    name: 'Agustin Soria',
    location: 'San Telmo, CABA',
    service: 'Alquiler Temporal',
    rating: 5,
    text: 'Hermoso lugar. 100% recomendable. Mucha confianza, tranquilidad y muy lindo lugar.',
    avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjU0NTS0N2BDrQoXK917xvM6nfgwJmFSRx3paV2KgUwNQqTp5thb=w72-h72-p-rp-mo-br100',
    date: 'Junio 2025', // hace 3 meses
  },
  // Post en portugués
  {
    id: 6,
    name: 'Giuliano Imparato',
    location: 'Palermo, CABA',
    service: 'Aluguel Temporário',
    rating: 5,
    text: 'Experiência fantástica com o Grupo Bairen. O apartamento estava impecável e o atendimento foi rápido e atencioso. Recomendo muito para quem vem a Buenos Aires.',
    avatar: 'https://lh3.googleusercontent.com/a/ACg8ocJpchkREwwigpqkl_8VSBcGNwvWFRSvv-KumsqWtYjUR9GzVnU=w72-h72-p-rp-mo-br100',
    date: 'Agosto 2025',
  },
];
