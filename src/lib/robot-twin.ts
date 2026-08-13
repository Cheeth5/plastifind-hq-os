import robotAsset from "@/assets/robot.glb.asset.json";

/**
 * Digital twin configuration.
 * Future-ready: swap `MODEL_URL` (or add entries to `ROBOTS`) to support
 * newer GLB versions or multiple robots without touching the viewer.
 */
export const ROBOTS = [
  {
    id: "labi-bot-v2",
    name: "Labi-Bot V2",
    url: robotAsset.url,
    /** Optional GLB node names to bind hotspots to, when the model exposes them. */
    nodeBindings: {} as Record<string, string>,
  },
] as const;

export const MODEL_URL = ROBOTS[0].url;

export type ViewMode = "normal" | "transparent" | "wireframe" | "engineering" | "xray" | "exploded";

export const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "transparent", label: "Transparent" },
  { id: "wireframe", label: "Filaire" },
  { id: "engineering", label: "Ingénierie" },
  { id: "xray", label: "Rayons X" },
  { id: "exploded", label: "Éclaté" },
];

export type CameraPresetId =
  | "hero"
  | "front"
  | "back"
  | "left"
  | "right"
  | "top"
  | "iso"
  | "closeup";

/** Positions are expressed in model radii, resolved against the fitted bounding sphere. */
export const CAMERA_PRESETS: {
  id: CameraPresetId;
  label: string;
  pos: [number, number, number];
  target: [number, number, number];
}[] = [
  { id: "hero", label: "Hero", pos: [2.1, 1.15, 3.0], target: [0, 0, 0] },
  { id: "front", label: "Face", pos: [0, 0.35, 3.6], target: [0, 0, 0] },
  { id: "back", label: "Arrière", pos: [0, 0.35, -3.6], target: [0, 0, 0] },
  { id: "left", label: "Gauche", pos: [-3.6, 0.3, 0.01], target: [0, 0, 0] },
  { id: "right", label: "Droite", pos: [3.6, 0.3, 0.01], target: [0, 0, 0] },
  { id: "top", label: "Dessus", pos: [0.01, 4.0, 0.01], target: [0, 0, 0] },
  { id: "iso", label: "Isométrique", pos: [2.6, 2.2, 2.6], target: [0, 0, 0] },
  { id: "closeup", label: "Gros plan", pos: [1.0, 0.5, 1.6], target: [0, 0.15, 0] },
];

export type Hotspot = {
  id: string;
  /** Node name in the GLB; used automatically when present. */
  node?: string;
  /** Fallback: normalized position inside the model bounding box (0..1 per axis). */
  u: [number, number, number];
  label: string;
  description: string;
  specs: [string, string][];
  version: string;
  status: "Opérationnel" | "En test" | "À concevoir" | "En commande";
  cost: number;
  supplier: string;
  maintenance: string;
  documents: string[];
  upgrades: string;
};

export const HOTSPOTS: Hotspot[] = [
  {
    id: "jetson",
    node: "NVIDIA_Jetson",
    u: [0.5, 0.78, 0.42],
    label: "NVIDIA Jetson",
    description:
      "Calculateur embarqué exécutant la pile de vision et la fusion de capteurs de Labi-Bot V2.",
    specs: [
      ["Modèle", "Jetson Orin Nano 8 Go"],
      ["Puissance IA", "40 TOPS"],
      ["Consommation", "7 – 15 W"],
      ["OS", "JetPack 6 / Ubuntu 22.04"],
    ],
    version: "v2.1",
    status: "En test",
    cost: 620,
    supplier: "NVIDIA / Mouser",
    maintenance: "Dernier flash firmware : sprint courant",
    documents: ["Fiche technique Jetson", "Schéma d'alimentation"],
    upgrades: "Passage Orin NX pour le suivi multi-objets temps réel.",
  },
  {
    id: "front-camera",
    node: "Front_Camera",
    u: [0.5, 0.62, 0.95],
    label: "Caméra avant",
    description: "Détection des déchets plastiques flottants et évitement d'obstacles proches.",
    specs: [
      ["Capteur", "IMX477 12 MP"],
      ["Champ", "120°"],
      ["Cadence", "60 fps @ 1080p"],
      ["Étanchéité", "IP67"],
    ],
    version: "v2.0",
    status: "Opérationnel",
    cost: 95,
    supplier: "Arducam",
    maintenance: "Nettoyage du dôme avant chaque mission.",
    documents: ["Protocole de calibration optique"],
    upgrades: "Ajout d'un filtre polarisant anti-reflets.",
  },
  {
    id: "rear-camera",
    node: "Rear_Camera",
    u: [0.5, 0.62, 0.05],
    label: "Caméra arrière",
    description: "Contrôle du sillage, de la trappe de collecte et des manœuvres d'accostage.",
    specs: [
      ["Capteur", "IMX219 8 MP"],
      ["Champ", "160°"],
      ["Cadence", "30 fps @ 1080p"],
    ],
    version: "v1.4",
    status: "Opérationnel",
    cost: 45,
    supplier: "Arducam",
    maintenance: "Contrôle du joint tous les 20 cycles.",
    documents: ["Plan de câblage CSI"],
    upgrades: "Vision nocturne infrarouge.",
  },
  {
    id: "battery",
    node: "Battery",
    u: [0.5, 0.3, 0.4],
    label: "Batterie",
    description: "Pack LiFePO4 scellé assurant l'autonomie de mission et la stabilité du châssis.",
    specs: [
      ["Chimie", "LiFePO4"],
      ["Capacité", "20 Ah / 25,6 V"],
      ["Autonomie", "≈ 4 h en collecte"],
      ["BMS", "Intégré, télémétrie CAN"],
    ],
    version: "v2.0",
    status: "En commande",
    cost: 480,
    supplier: "Victron / Fournisseur local",
    maintenance: "Cycle d'équilibrage mensuel.",
    documents: ["Analyse de sécurité batterie"],
    upgrades: "Recharge solaire d'appoint sur le pont.",
  },
  {
    id: "motors",
    node: "Motors",
    u: [0.22, 0.34, 0.3],
    label: "Motorisation",
    description: "Propulsion différentielle brushless étanche pour manœuvres précises à faible vitesse.",
    specs: [
      ["Type", "BLDC étanche 24 V"],
      ["Puissance", "2 × 250 W"],
      ["Contrôleurs", "FOC avec retour de courant"],
    ],
    version: "v2.0",
    status: "En test",
    cost: 340,
    supplier: "Maxon / T-Motor",
    maintenance: "Rinçage eau douce après usage marin.",
    documents: ["Banc d'essai propulsion"],
    upgrades: "Hélices anti-herbiers.",
  },
  {
    id: "wheels",
    node: "Wheels",
    u: [0.78, 0.24, 0.3],
    label: "Roues / propulseurs",
    description: "Ensemble de traction amphibie permettant la sortie de berge et la mise à l'eau.",
    specs: [
      ["Diamètre", "180 mm"],
      ["Matériau", "Polymère recyclé"],
      ["Charge", "35 kg"],
    ],
    version: "v1.2",
    status: "À concevoir",
    cost: 160,
    supplier: "Impression 3D interne",
    maintenance: "Contrôle d'usure visuel.",
    documents: ["Plans CAO roues"],
    upgrades: "Version en plastique collecté et recyclé.",
  },
  {
    id: "chassis",
    node: "Chassis",
    u: [0.5, 0.45, 0.5],
    label: "Châssis",
    description: "Coque modulaire flottante, étanche et réparable sur le terrain.",
    specs: [
      ["Matériau", "Aluminium + composite"],
      ["Masse", "18 kg à vide"],
      ["Flottabilité", "Réserve 40 %"],
    ],
    version: "v2.0",
    status: "En test",
    cost: 900,
    supplier: "Atelier UBO / partenaire local",
    maintenance: "Inspection des joints trimestrielle.",
    documents: ["Dossier mécanique V2"],
    upgrades: "Coque allégée à panneaux interchangeables.",
  },
  {
    id: "ai-module",
    node: "AI_Module",
    u: [0.5, 0.72, 0.6],
    label: "Module IA",
    description: "Pile de détection et de classification des déchets, entraînée sur données terrain.",
    specs: [
      ["Modèle", "YOLO custom plastique"],
      ["Précision", "mAP 0,87 (jeu interne)"],
      ["Latence", "22 ms / image"],
    ],
    version: "v0.9",
    status: "En test",
    cost: 0,
    supplier: "R&D interne",
    maintenance: "Réentraînement à chaque campagne.",
    documents: ["Jeu de données PlastiFind", "Rapport d'évaluation"],
    upgrades: "Segmentation fine par type de polymère.",
  },
  {
    id: "sensors",
    node: "Sensors",
    u: [0.34, 0.68, 0.72],
    label: "Capteurs",
    description: "Suite environnementale : turbidité, température, IMU et sondes de proximité.",
    specs: [
      ["IMU", "9 axes filtrée"],
      ["Environnement", "Turbidité, pH, température"],
      ["Bus", "I²C / CAN"],
    ],
    version: "v1.5",
    status: "Opérationnel",
    cost: 210,
    supplier: "Atlas Scientific",
    maintenance: "Étalonnage mensuel des sondes.",
    documents: ["Procédure d'étalonnage"],
    upgrades: "Mesure des microplastiques en continu.",
  },
  {
    id: "gps",
    node: "GPS",
    u: [0.64, 0.86, 0.5],
    label: "GPS / RTK",
    description: "Localisation centimétrique pour le suivi de trajectoire et la cartographie des zones.",
    specs: [
      ["Récepteur", "u-blox ZED-F9P"],
      ["Précision", "± 2 cm RTK"],
      ["Correction", "NTRIP réseau"],
    ],
    version: "v1.0",
    status: "En test",
    cost: 280,
    supplier: "u-blox / ArduSimple",
    maintenance: "Vérification de l'antenne avant mission.",
    documents: ["Configuration RTK"],
    upgrades: "Double antenne pour le cap précis.",
  },
  {
    id: "collection",
    node: "Collection_System",
    u: [0.5, 0.5, 0.86],
    label: "Système de collecte",
    description: "Convoyeur et bac amovible capturant les déchets flottants sans nuire à la faune.",
    specs: [
      ["Capacité", "60 L"],
      ["Débit", "≈ 0,4 m³/min"],
      ["Filtration", "Maille 5 mm"],
    ],
    version: "v2.0",
    status: "En test",
    cost: 520,
    supplier: "Fabrication interne",
    maintenance: "Vidange et rinçage après chaque sortie.",
    documents: ["Plan du convoyeur", "Étude d'impact faune"],
    upgrades: "Pesée embarquée et tri automatique.",
  },
];

export type Telemetry = { id: string; label: string; value: number; unit: string; tone: "primary" | "success" | "warning" | "danger" };

/** Placeholder telemetry — swap for live sensor rows when the fleet API lands. */
export const TELEMETRY: Telemetry[] = [
  { id: "battery", label: "Batterie", value: 86, unit: "%", tone: "success" },
  { id: "cpu", label: "CPU", value: 42, unit: "%", tone: "primary" },
  { id: "temp", label: "Température", value: 38, unit: "°C", tone: "warning" },
  { id: "camera", label: "Caméras", value: 100, unit: "%", tone: "success" },
  { id: "ai", label: "IA vision", value: 87, unit: "%", tone: "primary" },
  { id: "nav", label: "Navigation", value: 74, unit: "%", tone: "primary" },
  { id: "obstacle", label: "Obstacles", value: 92, unit: "%", tone: "success" },
  { id: "motors", label: "Santé moteurs", value: 68, unit: "%", tone: "warning" },
  { id: "link", label: "Liaison", value: 95, unit: "%", tone: "success" },
  { id: "storage", label: "Stockage", value: 54, unit: "%", tone: "primary" },
];
