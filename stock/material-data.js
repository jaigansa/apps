// --- CONFIGURATION DATA ---
const DENSITIES = {
    "Mild_Steel": 7850,
    "Aluminum_6061": 2700,
    "Stainless_304": 7980
};

const SHEET_SIZES = [
    { label: '4 ft x 8 ft', W: 1219, L: 2438 },
    { label: '5 ft x 10 ft', W: 1524, L: 3048 }
];

// --- MATERIAL AND SIZE DATA ---
const MATERIAL_DATA = {
    // --- FLAT STOCK ---
    sheet: [
        { label:'0.8 mm (22 Gauge)', T:0.8, type:'Sheet' },
        { label:'1.0 mm (20 Gauge)', T:1.0, type:'Sheet' },
        { label:'1.2 mm (18 Gauge)', T:1.2, type:'Sheet' },
        { label:'1.6 mm (16 Gauge)', T:1.6, type:'Sheet' },
        { label:'2.0 mm (14 Gauge)', T:2.0, type:'Sheet' },
        { label:'2.5 mm (12 Gauge)', T:2.5, type:'Sheet' },
        { label:'3.0 mm (10 Gauge)', T:3.0, type:'Sheet' },
        { label:'4.0 mm', T:4.0, type:'Sheet' },
        { label:'5.0 mm', T:5.0, type:'Sheet' }
    ],
    plate: [
        { label:'6 mm', T:6, type:'Plate' },
        { label:'8 mm', T:8, type:'Plate' },
        { label:'10 mm', T:10, type:'Plate' },
        { label:'12 mm', T:12, type:'Plate' },
        { label:'16 mm', T:16, type:'Plate' },
        { label:'20 mm', T:20, type:'Plate' },
        { label:'25 mm', T:25, type:'Plate' },
        { label:'32 mm', T:32, type:'Plate' },
        { label:'40 mm', T:40, type:'Plate' },
        { label:'50 mm', T:50, type:'Plate' }
    ],

    // --- RODS ---
    rod_round: [
        { label:'6 mm Dia', OD: 6, type:'RoundRod' },
        { label:'8 mm Dia', OD: 8, type:'RoundRod' },
        { label:'10 mm Dia', OD: 10, type:'RoundRod' },
        { label:'12 mm Dia', OD: 12, type:'RoundRod' },
        { label:'16 mm Dia', OD: 16, type:'RoundRod' },
        { label:'20 mm Dia', OD: 20, type:'RoundRod' },
        { label:'25 mm Dia', OD: 25, type:'RoundRod' },
        { label:'32 mm Dia', OD: 32, type:'RoundRod' },
        { label:'40 mm Dia', OD: 40, type:'RoundRod' },
        { label:'50 mm Dia', OD: 50, type:'RoundRod' },
        { label:'63 mm Dia', OD: 63, type:'RoundRod' },
        { label:'75 mm Dia', OD: 75, type:'RoundRod' },
        { label:'100 mm Dia', OD: 100, type:'RoundRod' }
    ],
    rod_square: [
        { label:'6 mm Sq', H: 6, T: 6, type:'SquareRod' },
        { label:'8 mm Sq', H: 8, T: 8, type:'SquareRod' },
        { label:'10 mm Sq', H: 10, T: 10, type:'SquareRod' },
        { label:'12 mm Sq', H: 12, T: 12, type:'SquareRod' },
        { label:'16 mm Sq', H: 16, T: 16, type:'SquareRod' },
        { label:'20 mm Sq', H: 20, T: 20, type:'SquareRod' },
        { label:'25 mm Sq', H: 25, T: 25, type:'SquareRod' },
        { label:'32 mm Sq', H: 32, T: 32, type:'SquareRod' },
        { label:'40 mm Sq', H: 40, T: 40, type:'SquareRod' },
        { label:'50 mm Sq', H: 50, T: 50, type:'SquareRod' }
    ],
    
    // --- FLAT BAR ---
    flat: [
        { label: '3 x 12 mm', H: 12, T: 3, type: 'FlatBar' },
        { label: '3 x 20 mm', H: 20, T: 3, type: 'FlatBar' },
        { label: '3 x 25 mm', H: 25, T: 3, type: 'FlatBar' },
        { label: '3 x 32 mm', H: 32, T: 3, type: 'FlatBar' },
        { label: '3 x 40 mm', H: 40, T: 3, type: 'FlatBar' },
        { label: '3 x 50 mm', H: 50, T: 3, type: 'FlatBar' },
        { label: '5 x 20 mm', H: 20, T: 5, type: 'FlatBar' },
        { label: '5 x 25 mm', H: 25, T: 5, type: 'FlatBar' },
        { label: '5 x 32 mm', H: 32, T: 5, type: 'FlatBar' },
        { label: '5 x 40 mm', H: 40, T: 5, type: 'FlatBar' },
        { label: '5 x 50 mm', H: 50, T: 5, type: 'FlatBar' },
        { label: '5 x 65 mm', H: 65, T: 5, type: 'FlatBar' },
        { label: '5 x 75 mm', H: 75, T: 5, type: 'FlatBar' },
        { label: '6 x 20 mm', H: 20, T: 6, type: 'FlatBar' },
        { label: '6 x 25 mm', H: 25, T: 6, type: 'FlatBar' },
        { label: '6 x 32 mm', H: 32, T: 6, type: 'FlatBar' },
        { label: '6 x 40 mm', H: 40, T: 6, type: 'FlatBar' },
        { label: '6 x 50 mm', H: 50, T: 6, type: 'FlatBar' },
        { label: '6 x 65 mm', H: 65, T: 6, type: 'FlatBar' },
        { label: '6 x 75 mm', H: 75, T: 6, type: 'FlatBar' },
        { label: '6 x 100 mm', H: 100, T: 6, type: 'FlatBar' },
        { label: '8 x 25 mm', H: 25, T: 8, type: 'FlatBar' },
        { label: '8 x 40 mm', H: 40, T: 8, type: 'FlatBar' },
        { label: '8 x 50 mm', H: 50, T: 8, type: 'FlatBar' },
        { label: '8 x 75 mm', H: 75, T: 8, type: 'FlatBar' },
        { label: '8 x 100 mm', H: 100, T: 8, type: 'FlatBar' },
        { label: '10 x 25 mm', H: 25, T: 10, type: 'FlatBar' },
        { label: '10 x 40 mm', H: 40, T: 10, type: 'FlatBar' },
        { label: '10 x 50 mm', H: 50, T: 10, type: 'FlatBar' },
        { label: '10 x 65 mm', H: 65, T: 10, type: 'FlatBar' },
        { label: '10 x 75 mm', H: 75, T: 10, type: 'FlatBar' },
        { label: '10 x 100 mm', H: 100, T: 10, type: 'FlatBar' },
        { label: '12 x 50 mm', H: 50, T: 12, type: 'FlatBar' },
        { label: '12 x 100 mm', H: 100, T: 12, type: 'FlatBar' }
    ],

// --- Angle (L-Bar) ---
angle: [
    { label: '20 x 20 x 3 mm', H: 20, W: 20, T: 3, type: 'Angle', weight: 0.9 },
    { label: '25 x 25 x 3 mm', H: 25, W: 25, T: 3, type: 'Angle', weight: 1.1 },
    { label: '25 x 25 x 5 mm', H: 25, W: 25, T: 5, type: 'Angle', weight: 1.8 },
    { label: '30 x 30 x 3 mm', H: 30, W: 30, T: 3, type: 'Angle', weight: 1.4 },
    { label: '30 x 30 x 5 mm', H: 30, W: 30, T: 5, type: 'Angle', weight: 2.1 },
    { label: '40 x 40 x 3 mm', H: 40, W: 40, T: 3, type: 'Angle', weight: 1.8 },
    { label: '40 x 40 x 5 mm', H: 40, W: 40, T: 5, type: 'Angle', weight: 2.9 },
    { label: '40 x 40 x 6 mm', H: 40, W: 40, T: 6, type: 'Angle', weight: 3.5 },
    { label: '50 x 50 x 3 mm', H: 50, W: 50, T: 3, type: 'Angle', weight: 2.3 },
    { label: '50 x 50 x 5 mm', H: 50, W: 50, T: 5, type: 'Angle', weight: 3.8 },
    { label: '50 x 50 x 6 mm', H: 50, W: 50, T: 6, type: 'Angle', weight: 4.5 },
    { label: '65 x 65 x 5 mm', H: 65, W: 65, T: 5, type: 'Angle', weight: 4.9 },
    { label: '65 x 65 x 6 mm', H: 65, W: 65, T: 6, type: 'Angle', weight: 5.8 },
    { label: '65 x 65 x 8 mm', H: 65, W: 65, T: 8, type: 'Angle', weight: 7.7 },
    { label: '75 x 75 x 6 mm', H: 75, W: 75, T: 6, type: 'Angle', weight: 6.8 },
    { label: '75 x 75 x 8 mm', H: 75, W: 75, T: 8, type: 'Angle', weight: 8.9 },
    { label: '75 x 75 x 10 mm', H: 75, W: 75, T: 10, type: 'Angle', weight: 11.0 },
    { label: '90 x 90 x 6 mm', H: 90, W: 90, T: 6, type: 'Angle', weight: 8.2 },
    { label: '90 x 90 x 8 mm', H: 90, W: 90, T: 8, type: 'Angle', weight: 10.8 },
    { label: '100 x 100 x 6 mm', H: 100, W: 100, T: 6, type: 'Angle', weight: 9.2 },
    { label: '100 x 100 x 8 mm', H: 100, W: 100, T: 8, type: 'Angle', weight: 12.1 },
    { label: '100 x 100 x 10 mm', H: 100, W: 100, T: 10, type: 'Angle', weight: 14.9 },
    { label: '100 x 100 x 12 mm', H: 100, W: 100, T: 12, type: 'Angle', weight: 17.7 },
    { label: '150 x 150 x 10 mm', H: 150, W: 150, T: 10, type: 'Angle', weight: 22.8 },
    { label: '150 x 150 x 12 mm', H: 150, W: 150, T: 12, type: 'Angle', weight: 27.2 },
    { label: '200 x 200 x 12 mm', H: 200, W: 200, T: 12, type: 'Angle', weight: 36.6 },

    // Unequal
    { label: '45 x 30 x 5 mm', H: 45, W: 30, T: 5, type: 'Angle', weight: 2.8 },
    { label: '60 x 40 x 5 mm', H: 60, W: 40, T: 5, type: 'Angle', weight: 3.7 },
    { label: '75 x 50 x 6 mm', H: 75, W: 50, T: 6, type: 'Angle', weight: 5.6 },
    { label: '100 x 75 x 8 mm', H: 100, W: 75, T: 8, type: 'Angle', weight: 10.5 },
    { label: '125 x 75 x 10 mm', H: 125, W: 75, T: 10, type: 'Angle', weight: 15.0 },
    { label: '150 x 75 x 10 mm', H: 150, W: 75, T: 10, type: 'Angle', weight: 17.0 }
],

  // --- Tubes ---
tube: [
    { label: '12.7 x 12.7 x 1.2 mm', H: 12.7, W: 12.7, T: 1.2, type: 'Tube' },
    { label: '19 x 19 x 1.2 mm', H: 19, W: 19, T: 1.2, type: 'Tube' },
    { label: '25 x 25 x 1.2 mm', H: 25, W: 25, T: 1.2, type: 'Tube' },
    { label: '25 x 25 x 1.6 mm', H: 25, W: 25, T: 1.6, type: 'Tube' },
    { label: '25 x 25 x 2.0 mm', H: 25, W: 25, T: 2.0, type: 'Tube' },
    { label: '32 x 32 x 1.6 mm', H: 32, W: 32, T: 1.6, type: 'Tube' },
    { label: '32 x 32 x 2.0 mm', H: 32, W: 32, T: 2.0, type: 'Tube' },
    { label: '38 x 38 x 1.6 mm', H: 38, W: 38, T: 1.6, type: 'Tube' },
    { label: '38 x 38 x 2.0 mm', H: 38, W: 38, T: 2.0, type: 'Tube' },
    { label: '50 x 50 x 2.0 mm', H: 50, W: 50, T: 2.0, type: 'Tube' },
    { label: '50 x 50 x 3.0 mm', H: 50, W: 50, T: 3.0, type: 'Tube' },
    { label: '75 x 75 x 3.0 mm', H: 75, W: 75, T: 3.0, type: 'Tube' },
    { label: '100 x 100 x 3.0 mm', H: 100, W: 100, T: 3.0, type: 'Tube' },
    { label: '100 x 100 x 4.0 mm', H: 100, W: 100, T: 4.0, type: 'Tube' },
    // Rect
    { label: '40 x 20 x 1.6 mm', H: 40, W: 20, T: 1.6, type: 'Tube' },
    { label: '50 x 25 x 1.6 mm', H: 50, W: 25, T: 1.6, type: 'Tube' },
    { label: '60 x 40 x 2.0 mm', H: 60, W: 40, T: 2.0, type: 'Tube' },
    { label: '80 x 40 x 2.5 mm', H: 80, W: 40, T: 2.5, type: 'Tube' },
    { label: '100 x 50 x 3.0 mm', H: 100, W: 50, T: 3.0, type: 'Tube' }
],

  // --- Pipes ---
pipe: [
    { label: '1/2" NB (21.3 mm OD x 2.0 mm T)', OD: 21.3, T: 2.0, type: 'Pipe' },
    { label: '3/4" NB (26.7 mm OD x 2.0 mm T)', OD: 26.7, T: 2.0, type: 'Pipe' },
    { label: '1" NB (33.4 mm OD x 2.6 mm T)', OD: 33.4, T: 2.6, type: 'Pipe' },
    { label: '1-1/4" NB (42.2 mm OD x 2.6 mm T)', OD: 42.2, T: 2.6, type: 'Pipe' },
    { label: '1-1/2" NB (48.3 mm OD x 2.9 mm T)', OD: 48.3, T: 2.9, type: 'Pipe' },
    { label: '2" NB (60.3 mm OD x 2.9 mm T)', OD: 60.3, T: 2.9, type: 'Pipe' },
    { label: '2-1/2" NB (73.0 mm OD x 3.2 mm T)', OD: 73.0, T: 3.2, type: 'Pipe' },
    { label: '3" NB (88.9 mm OD x 3.2 mm T)', OD: 88.9, T: 3.2, type: 'Pipe' },
    { label: '4" NB (114.3 mm OD x 3.6 mm T)', OD: 114.3, T: 3.6, type: 'Pipe' },
    { label: '6" NB (168.3 mm OD x 4.8 mm T)', OD: 168.3, T: 4.8, type: 'Pipe' }
],
    channel: [ 
        { label: 'ISMC 75 (75 x 40 x 4.8 mm)', H: 75, W: 40, T: 4.8, type: 'Channel', weight: 7.14 },
        { label: 'ISMC 100 (100 x 50 x 5.0 mm)', H: 100, W: 50, T: 5.0, type: 'Channel', weight: 9.56 },
        { label: 'ISMC 125 (125 x 65 x 5.3 mm)', H: 125, W: 65, T: 5.3, type: 'Channel', weight: 13.1 },
        { label: 'ISMC 150 (150 x 75 x 5.7 mm)', H: 150, W: 75, T: 5.7, type: 'Channel', weight: 16.8 },
        { label: 'ISMC 175 (175 x 75 x 6.0 mm)', H: 175, W: 75, T: 6.0, type: 'Channel', weight: 19.6 },
        { label: 'ISMC 200 (200 x 75 x 6.2 mm)', H: 200, W: 75, T: 6.2, type: 'Channel', weight: 22.3 },
        { label: 'ISMC 250 (250 x 80 x 7.2 mm)', H: 250, W: 80, T: 7.2, type: 'Channel', weight: 30.4 },
        { label: 'ISMC 300 (300 x 90 x 7.8 mm)', H: 300, W: 90, T: 7.8, type: 'Channel', weight: 36.3 },
        { label: 'ISMC 400 (400 x 100 x 8.8 mm)', H: 400, W: 100, T: 8.8, type: 'Channel', weight: 50.1 }
    ],
    beam: [ 
        { label: 'ISMB 100 (100 x 75 x 4.0 mm)', H: 100, W: 75, T: 4.0, type: 'IBeam', weight: 11.5 },
        { label: 'ISMB 125 (125 x 75 x 4.4 mm)', H: 125, W: 75, T: 4.4, type: 'IBeam', weight: 13.3 },
        { label: 'ISMB 150 (150 x 80 x 4.8 mm)', H: 150, W: 80, T: 4.8, type: 'IBeam', weight: 15.0 },
        { label: 'ISMB 175 (175 x 90 x 5.5 mm)', H: 175, W: 90, T: 5.5, type: 'IBeam', weight: 19.6 },
        { label: 'ISMB 200 (200 x 100 x 5.7 mm)', H: 200, W: 100, T: 5.7, type: 'IBeam', weight: 24.2 },
        { label: 'ISMB 225 (225 x 110 x 6.5 mm)', H: 225, W: 110, T: 6.5, type: 'IBeam', weight: 31.2 },
        { label: 'ISMB 250 (250 x 125 x 6.9 mm)', H: 250, W: 125, T: 6.9, type: 'IBeam', weight: 37.3 },
        { label: 'ISMB 300 (300 x 140 x 7.7 mm)', H: 300, W: 140, T: 7.7, type: 'IBeam', weight: 46.1 },
        { label: 'ISMB 350 (350 x 140 x 8.1 mm)', H: 350, W: 140, T: 8.1, type: 'IBeam', weight: 52.4 },
        { label: 'ISMB 400 (400 x 140 x 8.9 mm)', H: 400, W: 140, T: 8.9, type: 'IBeam', weight: 61.6 },
        { label: 'ISMB 450 (450 x 150 x 9.4 mm)', H: 450, W: 150, T: 9.4, type: 'IBeam', weight: 72.4 },
        { label: 'ISMB 500 (500 x 180 x 10.2 mm)', H: 500, W: 180, T: 10.2, type: 'IBeam', weight: 86.9 },
        { label: 'ISMB 600 (600 x 210 x 12.0 mm)', H: 600, W: 210, T: 12.0, type: 'IBeam', weight: 123.0 }
    ],


    // --- CONSUMABLES / CUSTOM ---
  consumables: [
        { label: 'Welding Rod (E6010)', customDescription: 'E6010 Welding Rod Box', type: 'Custom' },
        { label: 'Grinding Wheel (4.5")', customDescription: '4.5" Grinding Wheel', type: 'Custom' },
        { label: 'Cutting Disc (7")', customDescription: '7" Cutting Disc', type: 'Custom' },
        { label: 'Sanding Disc', customDescription: 'Sanding Disc', type: 'Custom' },
        { label: 'Gloves (Pair)', customDescription: 'Safety Gloves', type: 'Custom' }
    ],
    custom: []
};
