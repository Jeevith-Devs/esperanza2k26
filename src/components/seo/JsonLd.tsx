export default function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Esperanza 2K26 - VTMT Cultural Festival",
    "startDate": "2026-03-06T09:00:00+05:30",
    "endDate": "2026-03-06T18:00:00+05:30",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": "Vel Tech Multi Tech Dr.Rangarajan Dr.Sakunthala Engineering College",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "42, Avadi - Vel Tech Road, Vel Nagar, Avadi",
        "addressLocality": "Chennai",
        "postalCode": "600062",
        "addressRegion": "Tamil Nadu",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 13.1155,
        "longitude": 80.1471
      }
    },
    "image": [
      "https://esperanza2k26.vercel.app/opengraph-image.png",
      "https://esperanza2k26.vercel.app/assets/logo.png"
    ],
    "description": "Esperanza 2K26 is the annual cultural festival of Vel Tech Multi Tech featuring music, dance, arts, and technology events in Chennai.",
    "organizer": {
      "@type": "CollegeOrUniversity",
      "name": "Vel Tech Multi Tech",
      "url": "https://veltechmultitech.ac.in"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://esperanza2k26.vercel.app/events",
      "price": "300",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "validFrom": "2026-02-01T00:00:00+05:30"
    },
    "performer": {
      "@type": "PerformingGroup",
      "name": "Student Artists & Special Guests"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
