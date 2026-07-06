/**
 * StadiumPulse AI - Database Seed Script
 *
 * Populates the database with initial data for development/demo.
 * Run with: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ZONES = [
  { id: 'gate-1', name: 'Gate 1 (North)', type: 'GATE', capacity: 5000, x: 400, y: 50 },
  { id: 'gate-2', name: 'Gate 2 (Northeast)', type: 'GATE', capacity: 4500, x: 700, y: 120 },
  { id: 'gate-3', name: 'Gate 3 (East)', type: 'GATE', capacity: 5000, x: 780, y: 300 },
  { id: 'gate-4', name: 'Gate 4 (Southeast)', type: 'GATE', capacity: 4500, x: 700, y: 480 },
  { id: 'gate-5', name: 'Gate 5 (South)', type: 'GATE', capacity: 5000, x: 400, y: 550 },
  { id: 'gate-6', name: 'Gate 6 (Southwest)', type: 'GATE', capacity: 4500, x: 100, y: 480 },
  { id: 'gate-7', name: 'Gate 7 (West)', type: 'GATE', capacity: 5000, x: 20, y: 300 },
  { id: 'gate-8', name: 'Gate 8 (Northwest)', type: 'GATE', capacity: 4500, x: 100, y: 120 },
  { id: 'seating-a', name: 'Seating Block A', type: 'SEATING', capacity: 10000, x: 330, y: 130 },
  { id: 'seating-b', name: 'Seating Block B', type: 'SEATING', capacity: 10000, x: 570, y: 160 },
  { id: 'seating-c', name: 'Seating Block C', type: 'SEATING', capacity: 10000, x: 650, y: 280 },
  { id: 'seating-d', name: 'Seating Block D', type: 'SEATING', capacity: 10500, x: 570, y: 420 },
  { id: 'seating-e', name: 'Seating Block E', type: 'SEATING', capacity: 10000, x: 330, y: 470 },
  { id: 'seating-f', name: 'Seating Block F', type: 'SEATING', capacity: 10000, x: 160, y: 420 },
  { id: 'seating-g', name: 'Seating Block G', type: 'SEATING', capacity: 10000, x: 100, y: 280 },
  { id: 'seating-h', name: 'Seating Block H', type: 'SEATING', capacity: 10500, x: 160, y: 160 },
  { id: 'concourse-n', name: 'North Concourse', type: 'CONCOURSE', capacity: 8000, x: 400, y: 100 },
  { id: 'concourse-e', name: 'East Concourse', type: 'CONCOURSE', capacity: 8000, x: 720, y: 300 },
  { id: 'concourse-s', name: 'South Concourse', type: 'CONCOURSE', capacity: 8000, x: 400, y: 510 },
  { id: 'concourse-w', name: 'West Concourse', type: 'CONCOURSE', capacity: 8000, x: 60, y: 300 },
  { id: 'restroom-n', name: 'Restrooms (North)', type: 'RESTROOM', capacity: 200, x: 350, y: 90 },
  { id: 'restroom-e', name: 'Restrooms (East)', type: 'RESTROOM', capacity: 200, x: 740, y: 280 },
  { id: 'restroom-s', name: 'Restrooms (South)', type: 'RESTROOM', capacity: 200, x: 350, y: 520 },
  { id: 'restroom-w', name: 'Restrooms (West)', type: 'RESTROOM', capacity: 200, x: 40, y: 280 },
  { id: 'medical-n', name: 'Medical Point (North)', type: 'MEDICAL', capacity: 50, x: 450, y: 85 },
  { id: 'medical-s', name: 'Medical Point (South)', type: 'MEDICAL', capacity: 50, x: 450, y: 525 },
  { id: 'food-n', name: 'Food Court (North)', type: 'FOOD_COURT', capacity: 500, x: 300, y: 95 },
  { id: 'food-s', name: 'Food Court (South)', type: 'FOOD_COURT', capacity: 500, x: 300, y: 515 },
  { id: 'exit-n', name: 'Emergency Exit (North)', type: 'EXIT', capacity: 3000, x: 400, y: 30 },
  { id: 'exit-s', name: 'Emergency Exit (South)', type: 'EXIT', capacity: 3000, x: 400, y: 570 },
  { id: 'exit-e', name: 'Emergency Exit (East)', type: 'EXIT', capacity: 3000, x: 800, y: 300 },
  { id: 'exit-w', name: 'Emergency Exit (West)', type: 'EXIT', capacity: 3000, x: 0, y: 300 },
];

async function seed() {
  // eslint-disable-next-line no-console
  console.log('🌱 Seeding database...');

  // Create demo users
  const passwordHash = await bcrypt.hash('password123', 12);
  
  const users = [
    { email: 'fan@demo.com', name: 'Alex Fan', role: 'FAN', passwordHash },
    { email: 'volunteer@demo.com', name: 'Sam Volunteer', role: 'VOLUNTEER', passwordHash },
    { email: 'organizer@demo.com', name: 'Jordan Organizer', role: 'ORGANIZER', passwordHash },
    { email: 'admin@demo.com', name: 'Morgan Admin', role: 'ADMIN', passwordHash },
    { email: 'volunteer2@demo.com', name: 'Riley Helper', role: 'VOLUNTEER', passwordHash },
    { email: 'security@demo.com', name: 'Taylor Guard', role: 'ADMIN', passwordHash },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  // Create zones
  for (const zone of ZONES) {
    await prisma.zone.upsert({
      where: { id: zone.id },
      update: {},
      create: zone,
    });
  }

  // Create gates for gate zones
  const gateZones = ZONES.filter((z) => z.type === 'GATE');
  for (const gz of gateZones) {
    await prisma.gate.upsert({
      where: { id: gz.id + '-gate' },
      update: {},
      create: {
        id: gz.id + '-gate',
        name: gz.name,
        zoneId: gz.id,
        status: 'OPEN',
      },
    });
  }

  // Create sample incidents
  const fanUser = await prisma.user.findUnique({ where: { email: 'fan@demo.com' } });
  if (fanUser) {
    const sampleIncidents = [
      {
        title: 'Spilled drink near Gate 3',
        description: 'Large spill near the entrance of Gate 3, creating a slipping hazard',
        category: 'FACILITY',
        severity: 'LOW',
        zoneId: 'gate-3',
        reporterId: fanUser.id,
        status: 'OPEN',
      },
      {
        title: 'Medical assistance needed Block C',
        description: 'Elderly person feeling dizzy in Seating Block C, row 15',
        category: 'MEDICAL',
        severity: 'HIGH',
        zoneId: 'seating-c',
        reporterId: fanUser.id,
        status: 'IN_PROGRESS',
      },
    ];

    for (const incident of sampleIncidents) {
      await prisma.incident.create({ data: incident });
    }
  }

  // Create sample tasks
  const volunteer = await prisma.user.findUnique({ where: { email: 'volunteer@demo.com' } });
  if (volunteer) {
    const sampleTasks = [
      {
        title: 'Guide fans from Gate 1 to Block A',
        description: 'Help direct fan flow from Gate 1 to Seating Block A. Stand near concourse intersection.',
        priority: 'HIGH',
        zoneId: 'concourse-n',
        assigneeId: volunteer.id,
        status: 'ASSIGNED',
      },
      {
        title: 'Distribute water bottles at Food Court South',
        description: 'Set up water distribution point at Food Court South entrance.',
        priority: 'MEDIUM',
        zoneId: 'food-s',
        status: 'PENDING',
      },
    ];

    for (const task of sampleTasks) {
      await prisma.task.create({ data: task });
    }
  }

  // Create sample announcement
  await prisma.announcement.create({
    data: {
      originalText: 'Welcome to the FIFA World Cup 2026 Final! Gates open at 4:00 PM. Please have your tickets ready.',
      translations: JSON.stringify({
        en: 'Welcome to the FIFA World Cup 2026 Final! Gates open at 4:00 PM. Please have your tickets ready.',
        es: '¡Bienvenidos a la Final de la Copa Mundial FIFA 2026! Las puertas abren a las 4:00 PM.',
        fr: 'Bienvenue à la Finale de la Coupe du Monde FIFA 2026 ! Les portes ouvrent à 16h00.',
        pt: 'Bem-vindos à Final da Copa do Mundo FIFA 2026! Os portões abrem às 16h00.',
        ar: 'مرحباً بكم في نهائي كأس العالم FIFA 2026! تفتح البوابات في الساعة 4:00 مساءً.',
        hi: 'FIFA विश्व कप 2026 फाइनल में आपका स्वागत है! गेट शाम 4:00 बजे खुलेंगे।',
      }),
      priority: 'INFO',
    },
  });

  // eslint-disable-next-line no-console
  console.log('✅ Database seeded successfully!');
  // eslint-disable-next-line no-console
  console.log('   Demo accounts:');
  // eslint-disable-next-line no-console
  console.log('   - fan@demo.com / password123 (FAN)');
  // eslint-disable-next-line no-console
  console.log('   - volunteer@demo.com / password123 (VOLUNTEER)');
  // eslint-disable-next-line no-console
  console.log('   - organizer@demo.com / password123 (ORGANIZER)');
  // eslint-disable-next-line no-console
  console.log('   - admin@demo.com / password123 (ADMIN)');
}

seed()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
