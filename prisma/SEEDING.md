# Database Seeding

## Available Seed Commands

### Full Database Seed
```bash
npm run db:seed
```
Runs the complete database seeding process including:
- Admin users
- Package types
- Collectors
- HCM areas reference data
- HCM routes with detailed addresses
- HCM trash weight test data

### HCM Test Data Only
```bash
npm run db:seed:hcm
```
Runs only the HCM-specific test data seeding:
- HCM areas reference data
- HCM routes (6 districts, 85 wards, ~200+ routes)
- HCM trash weight assignments (~1,316+ assignments)

## Seed Files Structure

### Core Seeds (`prisma/seeds/`)
- `admin.seed.ts` - Admin users and system data
- `packages.seed.ts` - Package types and pricing
- `collectors.seed.ts` - Sample collector users

### HCM Test Data Seeds
- `hcm-areas.seed.ts` - HCM administrative areas reference data
- `hcm-routes.seed.ts` - HCM routes and trash weight assignments

### Main Seed Files
- `prisma/seed.ts` - Main seed file that runs all seeds
- `prisma/seed-hcm.ts` - HCM-only seed file

## HCM Test Data Coverage

The HCM test data provides comprehensive coverage for testing the trash weight reporting system:

### Geographic Coverage
- **Province**: TP. Hồ Chí Minh (code: 79)
- **Districts**: 6 districts
  - Quận 1 (760)
  - Quận Gò Vấp (762) 
  - Quận Bình Thạnh (763)
  - Quận Tân Bình (764)
  - Quận Phú Nhuận (766)
  - Huyện Bình Chánh (780)
- **Wards**: 85 wards total
- **Routes**: 2-4 routes per ward (~200+ routes)

### Time Coverage
- **Date Range**: November 1, 2024 - August 17, 2025
- **Frequency**: ~85% of days have data (15% randomly skipped)
- **Daily Volume**: 3-8 assignments per day
- **Total Assignments**: ~1,316+ route assignments

### Data Characteristics
- **Trash Weight**: 2-8 weight entries per assignment
- **Weight Range**: 10-50+ kg per entry (varies by area type)
- **Commercial Areas**: Higher weights for Quận 1, Quận 10
- **Weekend Effect**: 30% higher weights on weekends
- **Time Windows**: 6AM-2PM start times, 1-5 hour durations

## Usage Notes

1. **Initial Setup**: Run `npm run db:seed` for complete database setup
2. **Testing Reports**: Use `npm run db:seed:hcm` to regenerate test data
3. **Development**: HCM data is automatically included in full seed
4. **Cleanup**: Drop and recreate database to start fresh, then re-seed

## Migrating from Scripts

The previous `scripts/create-hcm-test-data.ts` has been refactored into proper seed files:
- Better organization and reusability
- Integrated with main seeding process
- Separated concerns (areas vs routes vs assignments)
- Easier to maintain and extend
