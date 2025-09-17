export type Testimonial = {
  id: number;
  name: string;
  location: string;
  service: string;
  rating: number;
  text: string;
  avatar: string;
  date: string;
};

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'María González',
    location: 'Posadas, Misiones',
    service: 'Alquiler Temporal',
    rating: 5,
    text: 'Excelente atención desde el primer contacto. Alquilé un departamento por 3 meses y todo fue perfecto. La propiedad estaba impecable y el equipo de Grupo Bairen estuvo siempre disponible para cualquier consulta.',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    date: 'Febrero 2024',
  },
  {
    id: 2,
    name: 'Carlos Ruiz',
    location: 'Buenos Aires',
    service: 'Compra de Propiedad',
    rating: 5,
    text: 'Compré mi casa de fin de semana en Posadas a través de Grupo Bairen. El proceso fue transparente y profesional. Me asesoraron en cada paso y logramos cerrar la operación en tiempo récord.',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    date: 'Enero 2024',
  },
  {
    id: 3,
    name: 'Ana Martínez',
    location: 'Oberá, Misiones',
    service: 'Venta de Propiedad',
    rating: 5,
    text: 'Vendí mi departamento con Grupo Bairen y superó todas mis expectativas. El precio obtenido fue mejor que otras propuestas y el tiempo de venta fue muy rápido. Altamente recomendables.',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    date: 'Diciembre 2023',
  },
  {
    id: 4,
    name: 'Roberto Silva',
    location: 'Puerto Iguazú, Misiones',
    service: 'Administración',
    rating: 5,
    text: 'Confío la administración de mis propiedades de alquiler a Grupo Bairen desde hace 2 años. Son serios, puntuales con los pagos y mantienen las propiedades en perfecto estado.',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    date: 'Noviembre 2023',
  },
  {
    id: 5,
    name: 'Laura Fernández',
    location: 'Eldorado, Misiones',
    service: 'Alquiler Temporal',
    rating: 5,
    text: 'Mi familia y yo pasamos las vacaciones en una casa hermosa que encontramos a través de Grupo Bairen. La atención fue excepcional y la propiedad superó nuestras expectativas.',
    avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg',
    date: 'Octubre 2023',
  },
  {
    id: 6,
    name: 'Diego Morales',
    location: 'Garupá, Misiones',
    service: 'Asesoramiento',
    rating: 5,
    text: 'Como inversor inmobiliario, el asesoramiento de Grupo Bairen ha sido fundamental. Me ayudaron a identificar las mejores oportunidades y maximizar el retorno de mis inversiones.',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
    date: 'Septiembre 2023',
  },
];
