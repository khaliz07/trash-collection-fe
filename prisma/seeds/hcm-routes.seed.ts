import { PrismaClient } from "@prisma/client";
import { hcmData } from "./hcm-areas.seed";

export async function seedHCMRoutes(prisma: PrismaClient) {
  console.log("🚛 Seeding HCM routes with detailed addresses...");

  try {
    const routes = [];
    let routeCounter = 1;

    // Create routes for each district and ward
    for (const district of hcmData.districts) {
      console.log(`📍 Creating routes for ${district.name}...`);

      for (const ward of district.wards) {
        // Create 2-4 routes per ward for good test coverage
        const routesPerWard = Math.floor(Math.random() * 3) + 2; // 2-4 routes

        for (let i = 0; i < routesPerWard; i++) {
          const routeName = `Tuyến ${district.name} - ${ward.name} (${i + 1})`;

          const address = {
            province: hcmData.province,
            district: {
              code: district.code,
              name: district.name,
              code_name: district.code_name,
              full_name: district.full_name,
              province_code: district.province_code,
            },
            ward: {
              code: ward.code,
              name: ward.name,
              code_name: ward.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "_"),
              full_name: ward.name,
              district_code: district.code,
              province_code: district.province_code,
            },
          };

          routes.push({
            name: routeName,
            description: `Tuyến thu gom rác khu vực ${ward.name}, ${district.name}. Phục vụ các khu dân cư và tuyến đường chính.`,
            startTime: { hour: 6, minute: 0 }, // Default start time 6:00 AM
            estimated_duration: Math.floor(Math.random() * 120) + 60, // 60-180 minutes
            total_distance_km: Math.floor(Math.random() * 15) + 5, // 5-20 km
            trackPoints: [], // Empty for now
            address: address,
          });

          routeCounter++;
        }
      }
    }

    console.log(`📊 Creating ${routes.length} routes...`);

    // Insert routes in batches
    const batchSize = 20;
    let created = 0;

    for (let i = 0; i < routes.length; i += batchSize) {
      const batch = routes.slice(i, i + batchSize);

      try {
        const createdRoutes = await prisma.route.createMany({
          data: batch,
          skipDuplicates: true,
        });
        created += batch.length;
        console.log(
          `✅ Created batch ${Math.ceil(
            (i + 1) / batchSize
          )} - Total: ${created} routes`
        );
      } catch (error) {
        console.log(
          `⚠️ Skipped batch ${Math.ceil(
            (i + 1) / batchSize
          )} - might already exist`
        );
      }
    }

    console.log(
      `🎉 Successfully created ${created} TP.HCM routes with detailed addresses!`
    );
    console.log(
      `📈 Coverage: ${
        hcmData.districts.length
      } districts, ${hcmData.districts.reduce(
        (sum, d) => sum + d.wards.length,
        0
      )} wards`
    );

    return created;
  } catch (error) {
    console.error("❌ Error creating TP.HCM routes:", error);
    return 0;
  }
}

export async function seedHCMTrashWeightData(prisma: PrismaClient) {
  console.log("🗑️ Creating trash weight data for TP.HCM routes...");

  try {
    // Get TP.HCM routes only
    const hcmRoutes = await prisma.route.findMany({
      where: {
        address: {
          path: ["province", "code"],
          equals: "79", // TP.HCM
        },
      },
    });

    if (hcmRoutes.length === 0) {
      console.log("❌ No TP.HCM routes found. Creating routes first...");
      await seedHCMRoutes(prisma);

      // Try again
      const newHcmRoutes = await prisma.route.findMany({
        where: {
          address: {
            path: ["province", "code"],
            equals: "79",
          },
        },
      });

      if (newHcmRoutes.length === 0) {
        console.log("❌ Still no TP.HCM routes found. Exiting...");
        return;
      }

      console.log(`✅ Found ${newHcmRoutes.length} TP.HCM routes to work with`);
    } else {
      console.log(`✅ Found ${hcmRoutes.length} existing TP.HCM routes`);
    }

    // Get collectors
    const collectors = await prisma.user.findMany({
      where: {
        role: "COLLECTOR",
      },
    });

    if (collectors.length === 0) {
      console.log("❌ No collectors found. Please create collectors first.");
      return;
    }

    const startDate = new Date("2024-11-01"); // Start from November 2024
    const endDate = new Date("2025-08-17");
    const assignments = [];

    console.log(
      `📅 Generating assignments from ${startDate.toLocaleDateString(
        "vi-VN"
      )} to ${endDate.toLocaleDateString("vi-VN")}`
    );

    // Generate more frequent assignments for better data
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      // Less skipping for TP.HCM - we want more data
      if (Math.random() < 0.15) continue; // Only skip 15% of days

      // More assignments per day for TP.HCM (3-8 per day)
      const assignmentsPerDay = Math.floor(Math.random() * 6) + 3;

      for (let i = 0; i < assignmentsPerDay; i++) {
        const route = hcmRoutes[Math.floor(Math.random() * hcmRoutes.length)];
        const collector =
          collectors[Math.floor(Math.random() * collectors.length)];

        // Generate realistic trash weight data (2-8 entries per assignment)
        const weightEntries = [];
        const numEntries = Math.floor(Math.random() * 7) + 2; // 2-8 entries

        for (let j = 0; j < numEntries; j++) {
          // Vary weight based on area type and time
          let baseWeight = 25; // Base weight

          // Weekend might have more trash
          if (d.getDay() === 0 || d.getDay() === 6) {
            baseWeight *= 1.3;
          }

          // Commercial areas (Quận 1, Quận 10) might have more
          const routeAddress = route.address as any;
          if (
            routeAddress?.district?.code === "760" ||
            routeAddress?.district?.code === "769"
          ) {
            baseWeight *= 1.5; // Commercial districts
          }

          weightEntries.push({
            weight: (Math.random() * baseWeight + 10).toFixed(1), // 10-50+ kg per entry
            timestamp: new Date(
              d.getTime() + Math.random() * 24 * 60 * 60 * 1000
            ).toISOString(),
            location: `Điểm ${j + 1} - ${
              routeAddress?.ward?.name || "Khu vực"
            }`,
          });
        }

        const assignmentDate = new Date(d);
        const startHour = Math.floor(Math.random() * 8) + 6; // 6AM - 2PM
        assignmentDate.setHours(startHour);
        assignmentDate.setMinutes(Math.floor(Math.random() * 60));

        const routeAddress = route.address as any;

        assignments.push({
          route_id: route.id,
          collector_id: collector.id,
          assigned_date: assignmentDate,
          time_window_start: `${startHour.toString().padStart(2, "0")}:00`,
          time_window_end: `${(startHour + 4).toString().padStart(2, "0")}:00`,
          status: "COMPLETED" as const,
          started_at: new Date(
            assignmentDate.getTime() + Math.random() * 60 * 60 * 1000
          ), // Start within 1 hour
          completed_at: new Date(
            assignmentDate.getTime() + (Math.random() * 4 + 1) * 60 * 60 * 1000
          ), // Complete 1-5 hours later
          trash_weight: weightEntries,
          notes: `Thu gom hoàn thành tại ${routeAddress?.ward?.name}, ${
            routeAddress?.district?.name
          } ngày ${assignmentDate.toLocaleDateString("vi-VN")}`,
        });
      }
    }

    console.log(`📊 Generated ${assignments.length} assignments for TP.HCM`);

    // Insert assignments in batches
    const batchSize = 30;
    let created = 0;

    for (let i = 0; i < assignments.length; i += batchSize) {
      const batch = assignments.slice(i, i + batchSize);

      try {
        await prisma.routeAssignment.createMany({
          data: batch,
          skipDuplicates: true,
        });
        created += batch.length;
        console.log(
          `✅ Created batch ${Math.ceil(
            (i + 1) / batchSize
          )} - Total: ${created} assignments`
        );
      } catch (error) {
        console.log(
          `⚠️ Skipped batch ${Math.ceil(
            (i + 1) / batchSize
          )} - might already exist`
        );
      }
    }

    // Calculate summary
    const totalWeight = assignments.reduce((sum, assignment) => {
      const weights = assignment.trash_weight as any[];
      return (
        sum +
        weights.reduce(
          (entrySum, entry) => entrySum + parseFloat(entry.weight),
          0
        )
      );
    }, 0);

    console.log(`🎉 Successfully created ${created} TP.HCM assignments!`);
    console.log(`📊 Summary:`);
    console.log(`   - Total assignments: ${created}`);
    console.log(`   - Total weight recorded: ${totalWeight.toFixed(1)} kg`);
    console.log(`   - TP.HCM districts covered: ${hcmData.districts.length}`);
    console.log(
      `   - TP.HCM wards covered: ${hcmData.districts.reduce(
        (sum, d) => sum + d.wards.length,
        0
      )}`
    );
    console.log(`   - Routes used: ${hcmRoutes.length}`);
    console.log(
      `   - Date range: ${startDate.toLocaleDateString(
        "vi-VN"
      )} - ${endDate.toLocaleDateString("vi-VN")}`
    );
  } catch (error) {
    console.error("❌ Error creating TP.HCM trash weight data:", error);
  }
}
