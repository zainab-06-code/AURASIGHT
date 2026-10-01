// Pre-loaded realistic scenarios for hackathon judges and instant user testing

export interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  category: 'surroundings' | 'document' | 'medication' | 'transit';
  mode: 'surroundings' | 'document' | 'medication' | 'currency';
  imagePath: string;
  sampleQuestions: string[];
  instantAnalysis: {
    immediateAlert: string;
    spatialSummary: string;
    spokenDescription: string;
    clockPositions: Array<{
      item: string;
      clock: string;
      distance: string;
      type: 'hazard' | 'pathway' | 'object' | 'text';
    }>;
    documentAnalysis?: {
      title: string;
      summary: string;
      keyFacts: string[];
      extractedText: string;
    };
    medicationAnalysis?: {
      name: string;
      dosage: string;
      instructions: string;
      warnings: string;
      expiry: string;
    };
    suggestedFollowUps: string[];
  };
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'living-room-hazard',
    title: 'Living Room Navigation',
    subtitle: 'Hazard radar with clock-direction triage',
    category: 'surroundings',
    mode: 'surroundings',
    imagePath: '/src/assets/images/scene_room_obstacles_1790842642296.jpg',
    sampleQuestions: [
      'Is there anything on the floor right in front of me?',
      'Which clock direction is the door?',
      'Can I walk forward safely?',
    ],
    instantAnalysis: {
      immediateAlert: 'Safe walkway ahead for 2 meters. Low wooden coffee table at 10 o’clock and armchair at 2 o’clock.',
      spatialSummary: 'A sunlit modern living room with a clear central hardwood corridor leading straight to an open doorway at 12 o’clock.',
      spokenDescription: 'You are facing a spacious living room. Your immediate path directly forward at 12 o’clock is completely clear for approximately two meters. To your left at 10 o’clock is the corner of a wooden coffee table about one meter away. To your right at 2 o’clock is a cushioned armchair. Straight ahead at 12 o’clock is an open hallway doorway about 3.5 meters away.',
      clockPositions: [
        { item: 'Open Hallway Door', clock: '12 o’clock', distance: '3.5 meters', type: 'pathway' },
        { item: 'Clear Walkway Corridor', clock: '12 o’clock', distance: '2.0 meters', type: 'pathway' },
        { item: 'Wooden Coffee Table Corner', clock: '10 o’clock', distance: '1.1 meters', type: 'hazard' },
        { item: 'Living Room Armchair', clock: '2 o’clock', distance: '1.4 meters', type: 'object' },
      ],
      suggestedFollowUps: [
        'Is the walkway rug flat or curled at the edge?',
        'How wide is the doorway straight ahead?',
        'Are there any pets or moving obstacles?',
      ],
    },
  },
  {
    id: 'medication-bottle',
    title: 'Prescription Medicine',
    subtitle: 'Dosage, warnings & expiry scanner',
    category: 'medication',
    mode: 'medication',
    imagePath: '/src/assets/images/scene_medication_bottle_1790842656123.jpg',
    sampleQuestions: [
      'How many pills do I take and when?',
      'What are the warnings on this bottle?',
      'What is the expiration date?',
    ],
    instantAnalysis: {
      immediateAlert: 'Prescription identified: Amoxicillin 500 milligram capsules. Take one capsule twice daily with meals.',
      spatialSummary: 'Standard amber prescription container with intact child-resistant white cap and clearly legible pharmacy label.',
      spokenDescription: 'This is Amoxicillin, 500 milligram capsules. The instructions state: take one capsule twice daily with food or meals. Important warning: complete the full prescribed course even if symptoms subside. The expiration date reads November 2027.',
      clockPositions: [
        { item: 'Dosage Instructions (Center Label)', clock: '12 o’clock', distance: 'Handheld', type: 'text' },
        { item: 'Warning Label (Side Panel)', clock: '3 o’clock', distance: 'Handheld', type: 'hazard' },
        { item: 'Expiration Date (Bottom Stamp)', clock: '6 o’clock', distance: 'Handheld', type: 'text' },
      ],
      medicationAnalysis: {
        name: 'Amoxicillin 500mg',
        dosage: '1 capsule twice daily (every 12 hours) with meals',
        instructions: 'Take with food or a glass of water. Finish entire course.',
        warnings: 'May cause allergic reactions in penicillin-sensitive patients. Do not skip doses.',
        expiry: '11/2027 (November 2027)',
      },
      suggestedFollowUps: [
        'Should I take this on an empty stomach or with food?',
        'Does the label show any refill information?',
        'What pharmacy number is printed?',
      ],
    },
  },
  {
    id: 'document-invoice',
    title: 'Utility Bill & Document',
    subtitle: 'Due dates, balances & mail summary',
    category: 'document',
    mode: 'document',
    imagePath: '/src/assets/images/scene_document_invoice_1790842667972.jpg',
    sampleQuestions: [
      'What is the total balance due and when?',
      'Who sent this letter?',
      'Read the executive summary of this bill.',
    ],
    instantAnalysis: {
      immediateAlert: 'Utility Statement from Metro Electric. Total amount due is $84.50, due on November 15th.',
      spatialSummary: 'Single-page printed utility statement with highlighted billing summary box in the upper right.',
      spokenDescription: 'You have a bill from Metro Electric Power Company. The total balance due is 84 dollars and 50 cents. The payment due date is November 15th. Your account number ends in 4928. No past-due balance is listed.',
      clockPositions: [
        { item: 'Metro Electric Header', clock: '11 o’clock', distance: 'Top page', type: 'text' },
        { item: 'Amount Due $84.50 Box', clock: '2 o’clock', distance: 'Upper right', type: 'text' },
        { item: 'Due Date November 15th', clock: '1 o’clock', distance: 'Upper right', type: 'text' },
        { item: 'Payment Remittance Slip', clock: '6 o’clock', distance: 'Bottom page', type: 'text' },
      ],
      documentAnalysis: {
        title: 'Metro Electric Power Statement',
        summary: 'Monthly residential electricity bill for billing cycle October 2026.',
        keyFacts: [
          'Total Amount Due: $84.50',
          'Due Date: November 15, 2026',
          'Account Number: ****-4928',
          'Service Address: Primary Residence',
        ],
        extractedText: 'METRO ELECTRIC POWER COMPANY\nStatement of Electric Service\nAccount Number: 481-930-4928\nDue Date: November 15, 2026\nTotal Amount Due: $84.50\nThank you for prompt payment.',
      },
      suggestedFollowUps: [
        'Is there a customer service phone number?',
        'Does it say what happens if paid late?',
        'Can you read the full text line by line?',
      ],
    },
  },
  {
    id: 'subway-signage',
    title: 'Transit Station Wayfinding',
    subtitle: 'Sign reading & platform direction',
    category: 'transit',
    mode: 'surroundings',
    imagePath: '/src/assets/images/scene_subway_signage_1790842679959.jpg',
    sampleQuestions: [
      'Which way to Track 4?',
      'Where is the Way Out exit?',
      'Are there stairs or escalators ahead?',
    ],
    instantAnalysis: {
      immediateAlert: 'Wayfinding sign ahead: Track 4 is straight forward. Way Out exit is to the right.',
      spatialSummary: 'High-contrast black-and-yellow overhead subway directional signage suspended from concrete ceiling.',
      spokenDescription: 'Overhead signage directly in front of you at 12 o’clock points straight forward for Track 4 Uptown Trains. An arrow pointing diagonally right at 2 o’clock indicates the Way Out street exit. The ground concourse ahead is level and free of immediate steps.',
      clockPositions: [
        { item: 'Track 4 Uptown Direction Sign', clock: '12 o’clock', distance: '4 meters ahead', type: 'text' },
        { item: 'Way Out Exit Arrow', clock: '2 o’clock', distance: '4 meters overhead', type: 'text' },
        { item: 'Concourse Walkway', clock: '12 o’clock', distance: 'Ground level', type: 'pathway' },
      ],
      suggestedFollowUps: [
        'Are there any turnstiles visible?',
        'Which way to the elevator?',
        'Are there people standing in front of the gate?',
      ],
    },
  },
];
