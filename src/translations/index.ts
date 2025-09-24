import { Language } from '../contexts/LanguageContext';

type TranslationKey =
  // Navigation & Auth
  | 'nav.home'
  | 'nav.properties'
  | 'nav.agents'
  | 'nav.about'
  | 'nav.contact'
  | 'nav.admin'
  | 'auth.signIn'
  | 'auth.signOut'
  | 'auth.listProperty'
  | 'auth.forgotPassword'
  | 'auth.rememberMe'

  // Hero Section
  | 'hero.title'
  | 'hero.subtitle'
  | 'hero.search.placeholder'
  | 'hero.filters.anyPrice'
  | 'hero.filters.anyType'
  | 'hero.filters.anyBedrooms'
  | 'hero.filters.search'
  | 'hero.search.selectDates'
  | 'hero.search.guests'

  // Properties
  | 'properties.title'
  | 'properties.subtitle'
  | 'properties.filters.price'
  | 'properties.filters.type'
  | 'properties.filters.bedrooms'
  | 'properties.filters.clear'
  | 'properties.noResults'
  | 'properties.featured'
  | 'properties.forSale'
  | 'properties.forRent'
  | 'properties.viewDetails'
  | 'properties.similar'

  // Property Details
  | 'property.features'
  | 'property.amenities'
  | 'property.contact'
  | 'property.schedule'
  | 'property.price'
  | 'property.beds'
  | 'property.baths'
  | 'property.sqft'
  | 'property.built'

  // Agents
  | 'agents.title'
  | 'agents.subtitle'
  | 'agents.search'
  | 'agents.specialties'
  | 'agents.contact'
  | 'agents.viewProfile'
  | 'agents.joinTeam'
  | 'agents.noResults'

  // About
  | 'about.title'
  | 'about.subtitle'
  | 'about.mission.title'
  | 'about.mission.text'
  | 'about.vision.title'
  | 'about.vision.text'
  | 'about.values.title'
  | 'about.values.integrity'
  | 'about.values.excellence'
  | 'about.values.service'
  | 'about.history.title'
  | 'about.history.founded'
  | 'about.history.expanded'
  | 'about.history.innovation'

  // Contact
  | 'contact.title'
  | 'contact.subtitle'
  | 'contact.form.name'
  | 'contact.form.email'
  | 'contact.form.phone'
  | 'contact.form.message'
  | 'contact.form.submit'
  | 'contact.info.address'
  | 'contact.info.phone'
  | 'contact.info.email'

  // Stats
  | 'stats.properties'
  | 'stats.clients'
  | 'stats.experience'
  | 'stats.locations'

  // CTA
  | 'cta.title'
  | 'cta.subtitle'
  | 'cta.button.primary'
  | 'cta.button.secondary'

  // Footer
  | 'footer.company'
  | 'footer.about'
  | 'footer.links'
  | 'footer.contact'
  | 'footer.rights'
  | 'footer.mortgage'
  | 'footer.blog'
  | 'footer.support'
  | 'footer.faq'
  | 'footer.privacy'
  | 'footer.terms'
  | 'footer.careers'

  // Homepage sections
  | 'home.testimonials.title'
  | 'home.testimonials.subtitle'
  | 'home.stats.title'
  | 'home.stats.subtitle'
  | 'home.loadingFeatured'
  | 'home.errorLoadingProperties'
  | 'home.featured.title'
  | 'home.featured.subtitle';

type Translations = {
  [key in TranslationKey]: string;
};

const translations: Record<Language, Translations> = {
  es: {
    // Navigation & Auth
    'nav.home': 'Inicio',
    'nav.properties': 'Propiedades',
    'nav.agents': 'Agentes',
    'nav.about': 'Nosotros',
    'nav.contact': 'Contacto',
    'nav.admin': 'Admin',
    'auth.signIn': 'Iniciar Sesión',
    'auth.signOut': 'Cerrar Sesión',
    'auth.listProperty': 'Publicar Propiedad',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.rememberMe': 'Recordarme',

    // Hero Section
  'hero.title': 'Encuentra tu Propiedad Ideal',
    'hero.subtitle': 'Descubre la propiedad perfecta de nuestra selección premium',
    'hero.search.placeholder': 'Ciudad, barrio o dirección',
    'hero.filters.anyPrice': 'Cualquier Precio',
    'hero.filters.anyType': 'Cualquier Tipo',
    'hero.filters.anyBedrooms': 'Habitaciones',
    'hero.filters.search': 'Buscar',
    'hero.search.selectDates': 'Selecciona fechas',
    'hero.search.guests': 'Huéspedes',

    // Properties
    'properties.title': 'Propiedades Disponibles',
    'properties.subtitle': 'Encuentra tu próxima propiedad',
    'properties.filters.price': 'Precio',
    'properties.filters.type': 'Tipo',
    'properties.filters.bedrooms': 'Habitaciones',
    'properties.filters.clear': 'Limpiar Filtros',
    'properties.noResults': 'No se encontraron propiedades',
    'properties.featured': 'Destacada',
    'properties.forSale': 'En Venta',
    'properties.forRent': 'En Alquiler',
    'properties.viewDetails': 'Ver Detalles',
    'properties.similar': 'Propiedades Similares',

    // Property Details
    'property.features': 'Características',
    'property.amenities': 'Comodidades',
    'property.contact': 'Contactar Agente',
    'property.schedule': 'Programar Visita',
    'property.price': 'Precio',
    'property.beds': 'Habitaciones',
    'property.baths': 'Baños',
    'property.sqft': 'Metros Cuadrados',
    'property.built': 'Año Construcción',

    // Agents
    'agents.title': 'Nuestros Agentes',
    'agents.subtitle': 'Conoce a nuestro equipo de expertos',
    'agents.search': 'Buscar agentes',
    'agents.specialties': 'Especialidades',
    'agents.contact': 'Contactar',
    'agents.viewProfile': 'Ver Perfil',
    'agents.joinTeam': 'Únete a Nuestro Equipo',
    'agents.noResults': 'No se encontraron agentes',

    // About
    'about.title': 'Sobre Nosotros',
    'about.subtitle': 'Construyendo Sueños desde 2010',
    'about.mission.title': 'Nuestra Misión',
    'about.mission.text': 'Transformar la experiencia inmobiliaria a través de la innovación y la integridad',
    'about.vision.title': 'Nuestra Visión',
    'about.vision.text': 'Ser el nombre más confiable en bienes raíces',
    'about.values.title': 'Nuestros Valores',
    'about.values.integrity': 'Integridad',
    'about.values.excellence': 'Excelencia',
    'about.values.service': 'Servicio',
    'about.history.title': 'Nuestra Historia',
    'about.history.founded': 'Fundación',
    'about.history.expanded': 'Expansión',
    'about.history.innovation': 'Innovación',

    // Contact
    'contact.title': 'Contáctanos',
    'contact.subtitle': 'Estamos aquí para ayudarte',
    'contact.form.name': 'Nombre Completo',
    'contact.form.email': 'Correo Electrónico',
    'contact.form.phone': 'Teléfono',
    'contact.form.message': 'Mensaje',
    'contact.form.submit': 'Enviar Mensaje',
    'contact.info.address': 'Dirección',
    'contact.info.phone': 'Teléfono',
    'contact.info.email': 'Correo',

    // Stats
    'stats.properties': 'Propiedades',
    'stats.clients': 'Clientes Satisfechos',
    'stats.experience': 'Años de Experiencia',
    'stats.locations': 'Ubicaciones',

    // CTA
    'cta.title': '¿Listo para encontrar tu Propiedad ideal?',
    'cta.subtitle': 'Nuestros agentes están listos para ayudarte',
    'cta.button.primary': 'Ver Propiedades',
    'cta.button.secondary': 'Contactar Agente',

    // Footer
    'footer.company': 'Ayudándote a encontrar tu propiedad ideal desde 2010. GrupoBairen ofrece una selección exclusiva de las mejores propiedades.',
    'footer.about': 'Sobre Nosotros',
    'footer.links': 'Enlaces Rápidos',
    'footer.contact': 'Contacto',
    'footer.rights': 'Todos los derechos reservados',
    'footer.mortgage': 'Calculadora de Hipoteca',
    'footer.blog': 'Blog Inmobiliario',
    'footer.support': 'Soporte',
    'footer.faq': 'Preguntas Frecuentes',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos de Servicio',
    'footer.careers': 'Trabaja con Nosotros'
    ,

    // Homepage sections
    'home.testimonials.title': 'Lo que dicen nuestros clientes',
    'home.testimonials.subtitle': 'No te quedes solo con nuestra palabra — escucha a nuestros clientes satisfechos',
  'home.stats.title': '¿Por qué elegir Grupo Bairen?',
    'home.stats.subtitle': 'Con experiencia y dedicación, hemos ayudado a cientos de clientes a encontrar su propiedad ideal',
    'home.loadingFeatured': 'Cargando propiedades destacadas...',
    'home.errorLoadingProperties': 'Error al cargar propiedades.'
    ,
    'home.featured.title': 'Propiedades Destacadas',
    'home.featured.subtitle': 'Explora entre nuestra colección de propiedades exclusivas.'
  },

  en: {
    // Navigation & Auth
    'nav.home': 'Home',
    'nav.properties': 'Properties',
    'nav.agents': 'Agents',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin',
    'auth.signIn': 'Sign In',
    'auth.signOut': 'Sign Out',
    'auth.listProperty': 'List Property',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.rememberMe': 'Remember Me',

    // Hero Section
  'hero.title': 'Find Your Ideal Property',
    'hero.subtitle': 'Discover the perfect property from our curated selection',
    'hero.search.placeholder': 'City, neighborhood, or address',
    'hero.filters.anyPrice': 'Any Price',
    'hero.filters.anyType': 'Any Type',
    'hero.filters.anyBedrooms': 'Bedrooms',
    'hero.filters.search': 'Search',
    'hero.search.selectDates': 'Select dates',
    'hero.search.guests': 'Guests',

    // Properties
    'properties.title': 'Available Properties',
    'properties.subtitle': 'Find your next property',
    'properties.filters.price': 'Price',
    'properties.filters.type': 'Type',
    'properties.filters.bedrooms': 'Bedrooms',
    'properties.filters.clear': 'Clear Filters',
    'properties.noResults': 'No properties found',
    'properties.featured': 'Featured',
    'properties.forSale': 'For Sale',
    'properties.forRent': 'For Rent',
    'properties.viewDetails': 'View Details',
    'properties.similar': 'Similar Properties',

    // Property Details
    'property.features': 'Features',
    'property.amenities': 'Amenities',
    'property.contact': 'Contact Agent',
    'property.schedule': 'Schedule Viewing',
    'property.price': 'Price',
    'property.beds': 'Bedrooms',
    'property.baths': 'Bathrooms',
    'property.sqft': 'Square Feet',
    'property.built': 'Year Built',

    // Agents
    'agents.title': 'Our Agents',
    'agents.subtitle': 'Meet our team of experts',
    'agents.search': 'Search agents',
    'agents.specialties': 'Specialties',
    'agents.contact': 'Contact',
    'agents.viewProfile': 'View Profile',
    'agents.joinTeam': 'Join Our Team',
    'agents.noResults': 'No agents found',

    // About
    'about.title': 'About Us',
    'about.subtitle': 'Building Dreams Since 2010',
    'about.mission.title': 'Our Mission',
    'about.mission.text': 'Transform the real estate experience through innovation and integrity',
    'about.vision.title': 'Our Vision',
    'about.vision.text': 'To be the most trusted name in real estate',
    'about.values.title': 'Our Values',
    'about.values.integrity': 'Integrity',
    'about.values.excellence': 'Excellence',
    'about.values.service': 'Service',
    'about.history.title': 'Our History',
    'about.history.founded': 'Foundation',
    'about.history.expanded': 'Expansion',
    'about.history.innovation': 'Innovation',

    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'We\'re here to help',
    'contact.form.name': 'Full Name',
    'contact.form.email': 'Email Address',
    'contact.form.phone': 'Phone Number',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Send Message',
    'contact.info.address': 'Address',
    'contact.info.phone': 'Phone',
    'contact.info.email': 'Email',

    // Stats
    'stats.properties': 'Properties',
    'stats.clients': 'Happy Clients',
    'stats.experience': 'Years Experience',
    'stats.locations': 'Locations',

    // CTA
    'cta.title': 'Ready to Find Your Dream Home?',
    'cta.subtitle': 'Our agents are ready to help you find the perfect property',
    'cta.button.primary': 'Browse Properties',
    'cta.button.secondary': 'Contact Agent',

    // Footer
    'footer.company': 'Helping you find your dream property since 2010. GrupoBairen offers a curated selection of the finest properties.',
    'footer.about': 'About Us',
    'footer.links': 'Quick Links',
    'footer.contact': 'Contact',
    'footer.rights': 'All rights reserved',
    'footer.mortgage': 'Mortgage Calculator',
    'footer.blog': 'Real Estate Blog',
    'footer.support': 'Support',
    'footer.faq': 'FAQs',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.careers': 'Careers'
    ,

    // Homepage sections
    'home.testimonials.title': 'What Our Clients Say',
    'home.testimonials.subtitle': "Don't just take our word for it - hear from our satisfied clients",
  'home.stats.title': 'Why Choose Grupo Bairen?',
    'home.stats.subtitle': "With our expertise and dedication, we've helped hundreds of clients find their perfect property",
    'home.loadingFeatured': 'Loading featured properties...',
    'home.errorLoadingProperties': 'Error loading properties.'
    ,
    'home.featured.title': 'Featured Properties',
    'home.featured.subtitle': 'Explore our exclusive collection of premium properties.'
  },

  pt: {
    // Navigation & Auth
    'nav.home': 'Início',
    'nav.properties': 'Imóveis',
    'nav.agents': 'Agentes',
    'nav.about': 'Sobre',
    'nav.contact': 'Contato',
    'nav.admin': 'Admin',
    'auth.signIn': 'Entrar',
    'auth.signOut': 'Sair',
    'auth.listProperty': 'Anunciar Imóvel',
    'auth.forgotPassword': 'Esqueceu a senha?',
    'auth.rememberMe': 'Lembrar-me',

    // Hero Section
  'hero.title': 'Encontre sua Propriedade Ideal',
    'hero.subtitle': 'Descubra a propriedade perfeita em nossa seleção premium',
    'hero.search.placeholder': 'Cidade, bairro ou endereço',
    'hero.filters.anyPrice': 'Qualquer Preço',
    'hero.filters.anyType': 'Qualquer Tipo',
    'hero.filters.anyBedrooms': 'Quartos',
    'hero.filters.search': 'Buscar',
    'hero.search.selectDates': 'Selecione datas',
    'hero.search.guests': 'Hóspedes',

    // Properties
    'properties.title': 'Imóveis Disponíveis',
    'properties.subtitle': 'Encontre seu próximo imóvel',
    'properties.filters.price': 'Preço',
    'properties.filters.type': 'Tipo',
    'properties.filters.bedrooms': 'Quartos',
    'properties.filters.clear': 'Limpar Filtros',
    'properties.noResults': 'Nenhum imóvel encontrado',
    'properties.featured': 'Destaque',
    'properties.forSale': 'À Venda',
    'properties.forRent': 'Para Alugar',
    'properties.viewDetails': 'Ver Detalhes',
    'properties.similar': 'Imóveis Similares',

    // Property Details
    'property.features': 'Características',
    'property.amenities': 'Comodidades',
    'property.contact': 'Contatar Agente',
    'property.schedule': 'Agendar Visita',
    'property.price': 'Preço',
    'property.beds': 'Quartos',
    'property.baths': 'Banheiros',
    'property.sqft': 'Metros Quadrados',
    'property.built': 'Ano Construção',

    // Agents
    'agents.title': 'Nossos Agentes',
    'agents.subtitle': 'Conheça nossa equipe de especialistas',
    'agents.search': 'Buscar agentes',
    'agents.specialties': 'Especialidades',
    'agents.contact': 'Contato',
    'agents.viewProfile': 'Ver Perfil',
    'agents.joinTeam': 'Junte-se à Nossa Equipe',
    'agents.noResults': 'Nenhum agente encontrado',

    // About
    'about.title': 'Sobre Nós',
    'about.subtitle': 'Construindo Sonhos desde 2010',
    'about.mission.title': 'Nossa Missão',
    'about.mission.text': 'Transformar a experiência imobiliária através da inovação e integridade',
    'about.vision.title': 'Nossa Visão',
    'about.vision.text': 'Ser o nome mais confiável no mercado imobiliário',
    'about.values.title': 'Nossos Valores',
    'about.values.integrity': 'Integridade',
    'about.values.excellence': 'Excelência',
    'about.values.service': 'Serviço',
    'about.history.title': 'Nossa História',
    'about.history.founded': 'Fundação',
    'about.history.expanded': 'Expansão',
    'about.history.innovation': 'Inovação',

    // Contact
    'contact.title': 'Contate-nos',
    'contact.subtitle': 'Estamos aqui para ajudar',
    'contact.form.name': 'Nome Completo',
    'contact.form.email': 'Email',
    'contact.form.phone': 'Telefone',
    'contact.form.message': 'Mensagem',
    'contact.form.submit': 'Enviar Mensagem',
    'contact.info.address': 'Endereço',
    'contact.info.phone': 'Telefone',
    'contact.info.email': 'Email',

    // Stats
    'stats.properties': 'Imóveis',
    'stats.clients': 'Clientes Satisfeitos',
    'stats.experience': 'Anos de Experiência',
    'stats.locations': 'Localizações',

    // CTA
    'cta.title': 'Pronto para Encontrar sua Casa dos Sonhos?',
    'cta.subtitle': 'Nossos agentes estão prontos para ajudar você',
    'cta.button.primary': 'Ver Imóveis',
    'cta.button.secondary': 'Contatar Agente',

    // Footer
    'footer.company': 'Ajudando você a encontrar seu imóvel ideal desde 2010. GrupoBairen oferece uma seleção exclusiva das melhores propriedades.',
    'footer.about': 'Sobre Nós',
    'footer.links': 'Links Rápidos',
    'footer.contact': 'Contato',
    'footer.rights': 'Todos os direitos reservados',
    'footer.mortgage': 'Calculadora de Financiamento',
    'footer.blog': 'Blog Imobiliário',
    'footer.support': 'Suporte',
    'footer.faq': 'Perguntas Frequentes',
    'footer.privacy': 'Política de Privacidade',
    'footer.terms': 'Termos de Serviço',
    'footer.careers': 'Carreiras'
    ,

    // Homepage sections
    'home.testimonials.title': 'O que dizem nossos clientes',
    'home.testimonials.subtitle': 'Não fique só com a nossa palavra — veja o que dizem nossos clientes satisfeitos',
  'home.stats.title': 'Por que escolher o Grupo Bairen?',
    'home.stats.subtitle': 'Com experiência e dedicação, ajudamos centenas de clientes a encontrar o imóvel ideal',
    'home.loadingFeatured': 'Carregando imóveis em destaque...',
    'home.errorLoadingProperties': 'Erro ao carregar imóveis.'
    ,
    'home.featured.title': 'Imóveis em Destaque',
    'home.featured.subtitle': 'Explore nossa coleção exclusiva de propriedades premium.'
  }
};

export const useTranslation = (language: Language) => {
  return (key: TranslationKey): string => {
    return translations[language][key];
  };
};