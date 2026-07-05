import { formatCurrency, projectTags } from '../src/lib/utils';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed += 1;
  } catch (error) {
    console.error(`✗ ${name}: ${error instanceof Error ? error.message : String(error)}`);
    failed += 1;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

console.log('\nBuildWise AI Verification\n');

test('formats estimates in Pakistani Rupees', () => {
  const value = formatCurrency(1250000);
  assert(value.includes('PKR') || value.includes('Rs'), `Unexpected currency output: ${value}`);
});

test('generates supplier matching tags from project choices', () => {
  const tags = projectTags({
    material_quality: 'Luxury',
    interior_finish: 'Premium',
    exterior_finish: 'Premium',
    construction_type: 'Turnkey',
    solar: true,
    smart_home: true,
    swimming_pool: true
  });
  for (const tag of ['luxury', 'premium', 'finishing', 'solar', 'electrical']) {
    assert(tags.includes(tag), `Expected tag ${tag}`);
  }
});

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
