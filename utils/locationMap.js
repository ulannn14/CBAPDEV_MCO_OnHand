// utils/locationMap.js

const locationMap = {
  "Manila": [
    "Pasay", "Makati", "San Juan", "Mandaluyong", "Quezon City", "Caloocan",
    "Taguig", "Pasig", "Marikina", "Parañaque", "Valenzuela",
    "Malabon", "Navotas", "Las Piñas", "Cavite", "Rizal", "Laguna", "Bulacan"
  ],

  "Quezon City": [
    "San Juan", "Marikina", "Mandaluyong", "Pasig", "Caloocan", "Manila",
    "Valenzuela", "Malabon", "Navotas", "Taguig", "Makati", "Pasay",
    "Parañaque", "Las Piñas", "Rizal", "Bulacan", "Cavite", "Laguna"
  ],

  "Makati": [
    "Taguig", "Mandaluyong", "Pasay", "Manila", "Pasig",
    "San Juan", "Quezon City", "Parañaque", "Las Piñas",
    "Muntinlupa", "Caloocan", "Marikina", "Valenzuela",
    "Malabon", "Navotas", "Cavite", "Laguna", "Rizal", "Bulacan"
  ],

  "Taguig": [
    "Makati", "Pasig", "Mandaluyong", "Pasay", "Manila",
    "Parañaque", "Quezon City", "Marikina", "Las Piñas",
    "Muntinlupa", "San Juan", "Caloocan", "Valenzuela",
    "Malabon", "Navotas", "Cavite", "Laguna", "Rizal", "Bulacan"
  ],

  "Mandaluyong": [
    "San Juan", "Pasig", "Makati", "Quezon City", "Manila",
    "Taguig", "Pasay", "Marikina", "Caloocan", "Parañaque",
    "Valenzuela", "Malabon", "Navotas", "Las Piñas",
    "Muntinlupa", "Rizal", "Cavite", "Laguna", "Bulacan"
  ],

  "Pasig": [
    "Mandaluyong", "Taguig", "Makati", "Marikina", "Quezon City",
    "San Juan", "Pasay", "Manila", "Caloocan",
    "Parañaque", "Valenzuela", "Malabon", "Navotas",
    "Las Piñas", "Muntinlupa", "Rizal", "Cavite", "Laguna", "Bulacan"
  ],

  "Pasay": [
    "Manila", "Makati", "Taguig", "Parañaque", "Mandaluyong",
    "Las Piñas", "Quezon City", "Caloocan", "San Juan",
    "Pasig", "Marikina", "Valenzuela", "Malabon", "Navotas",
    "Muntinlupa", "Cavite", "Laguna", "Rizal", "Bulacan"
  ],

  "Valenzuela": [
    "Caloocan", "Malabon", "Navotas", "Quezon City",
    "Manila", "San Juan", "Mandaluyong", "Makati",
    "Pasig", "Taguig", "Parañaque", "Pasay",
    "Marikina", "Las Piñas", "Muntinlupa",
    "Bulacan", "Rizal", "Cavite", "Laguna"
  ],

  "Caloocan": [
    "Malabon", "Navotas", "Valenzuela", "Quezon City",
    "Manila", "San Juan", "Mandaluyong", "Makati",
    "Pasig", "Taguig", "Marikina", "Pasay",
    "Parañaque", "Las Piñas", "Muntinlupa",
    "Bulacan", "Rizal", "Cavite", "Laguna"
  ],

  "Las Piñas": [
    "Parañaque", "Muntinlupa", "Cavite", "Pasay", "Taguig",
    "Makati", "Manila", "Mandaluyong", "Pasig",
    "Quezon City", "Marikina", "San Juan",
    "Caloocan", "Valenzuela", "Malabon", "Navotas",
    "Laguna", "Rizal", "Bulacan"
  ],

  "Muntinlupa": [
    "Las Piñas", "Parañaque", "Cavite", "Laguna",
    "Taguig", "Makati", "Pasay", "Manila",
    "Mandaluyong", "Pasig", "Quezon City",
    "San Juan", "Marikina", "Caloocan",
    "Valenzuela", "Malabon", "Navotas",
    "Rizal", "Bulacan"
  ],

  "Parañaque": [
    "Las Piñas", "Pasay", "Taguig", "Makati", "Muntinlupa",
    "Manila", "Cavite", "Mandaluyong", "Pasig",
    "Quezon City", "Marikina", "San Juan",
    "Caloocan", "Valenzuela", "Malabon", "Navotas",
    "Laguna", "Rizal", "Bulacan"
  ],

  "Marikina": [
    "Pasig", "Quezon City", "San Juan", "Mandaluyong",
    "Taguig", "Makati", "Manila", "Caloocan",
    "Valenzuela", "Malabon", "Navotas",
    "Pasay", "Parañaque", "Las Piñas", "Muntinlupa",
    "Rizal", "Bulacan", "Cavite", "Laguna"
  ],

  "San Juan": [
    "Mandaluyong", "Quezon City", "Pasig", "Makati",
    "Manila", "Taguig", "Marikina", "Pasay",
    "Caloocan", "Valenzuela", "Malabon", "Navotas",
    "Parañaque", "Las Piñas", "Muntinlupa",
    "Rizal", "Bulacan", "Cavite", "Laguna"
  ],

  "Malabon": [
    "Navotas", "Caloocan", "Valenzuela", "Quezon City",
    "Manila", "San Juan", "Mandaluyong", "Makati",
    "Pasig", "Taguig", "Marikina", "Pasay",
    "Parañaque", "Las Piñas", "Muntinlupa",
    "Bulacan", "Rizal", "Cavite", "Laguna"
  ],

  "Navotas": [
    "Malabon", "Caloocan", "Valenzuela", "Quezon City",
    "Manila", "San Juan", "Mandaluyong", "Makati",
    "Pasig", "Taguig", "Marikina", "Pasay",
    "Parañaque", "Las Piñas", "Muntinlupa",
    "Bulacan", "Rizal", "Cavite", "Laguna"
  ],

  "Cavite": [
    "Las Piñas", "Parañaque", "Muntinlupa", "Laguna",
    "Taguig", "Makati", "Pasay", "Manila",
    "Mandaluyong", "Pasig", "Quezon City",
    "Marikina", "San Juan", "Caloocan",
    "Valenzuela", "Malabon", "Navotas",
    "Rizal", "Bulacan"
  ],

  "Laguna": [
    "Muntinlupa", "Cavite", "Las Piñas", "Parañaque",
    "Taguig", "Makati", "Pasay", "Manila",
    "Mandaluyong", "Pasig", "Quezon City",
    "San Juan", "Marikina", "Caloocan",
    "Valenzuela", "Malabon", "Navotas",
    "Rizal", "Bulacan"
  ],

  "Rizal": [
    "Marikina", "Pasig", "Quezon City", "San Juan",
    "Mandaluyong", "Taguig", "Makati", "Manila",
    "Pasay", "Caloocan", "Valenzuela", "Malabon", "Navotas",
    "Parañaque", "Las Piñas", "Muntinlupa",
    "Laguna", "Cavite", "Bulacan"
  ],

  "Bulacan": [
    "Valenzuela", "Caloocan", "Malabon", "Navotas",
    "Quezon City", "Manila", "San Juan", "Mandaluyong",
    "Makati", "Pasig", "Taguig", "Marikina",
    "Pasay", "Parañaque", "Las Piñas", "Muntinlupa",
    "Rizal", "Cavite", "Laguna"
  ]
};

module.exports = locationMap;
