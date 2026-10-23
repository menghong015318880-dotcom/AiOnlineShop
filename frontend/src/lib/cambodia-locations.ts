// Addrss options for the checkout form.
// Provinces: complete. Districts: only Phnom Penh. Communes: only Doun Penh (SAMPLE data,
// please check the names). When there is no list, the form shows a text box instead.

export const PROVINCES = [
  "Banteay Meanchey", "Battambang", "Kampong Cham", "Kampong Chhnang", "Kampong Speu",
  "Kampong Thom", "Kampot", "Kandal", "Kep", "Koh Kong", "Kratie", "Mondulkiri",
  "Oddar Meanchey", "Pailin", "Phnom Penh", "Preah Sihanouk", "Preah Vihear", "Pursat",
  "Prey Veng", "Ratanakiri", "Siem Reap", "Stung Treng", "Svay Rieng", "Takeo", "Tbong Khmum",
];

// Key: province name
export const DISTRICTS: Record<string, string[]> = {
  "Phnom Penh": [
    "Chamkar Mon", "Doun Penh", "Prampir Meakkakra", "Tuol Kork", "Dangkao", "Mean Chey",
    "Russey Keo", "Sen Sok", "Pur SenChey", "Chroy Changvar", "Prek Pnov", "Chbar Ampov",
    "Boeng Keng Kang", "Kamboul",
  ],
};

// Key: "Province|District"
export const COMMUNES: Record<string, string[]> = {
  "Phnom Penh|Doun Penh": [
    "Phsar Thmei I", "Phsar Thmei II", "Phsar Thmei III", "Boeng Reang", "Phsar Kandal I",
    "Phsar Kandal II", "Chey Chummeah", "Phsar Chas", "Srah Chak", "Voat Phnum", "Chaktomuk",
  ],
};