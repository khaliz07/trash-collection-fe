import { PrismaClient, AssignmentStatus, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function createTrashWeightTestData() {
  console.log("🗑️ Creating trash weight test data...");

  try {
    // Get existing routes with address information
    const routes = await prisma.route.findMany({
      where: {
        address: {
          not: Prisma.JsonNull,
        },
      },
    });

    if (routes.length === 0) {
      console.log(
        "❌ No routes with address information found. Please create routes with addresses first."
      );
      return;
    }

    // Get existing collectors
    const collectors = await prisma.user.findMany({
      where: {
        role: "COLLECTOR",
      },
    });

    if (collectors.length === 0) {
      console.log("❌ No collectors found. Please create collectors first.");
      return;
    }

    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-08-17");
    const assignments = [];

    // Generate assignments for the past 7 months
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      // Skip some days randomly to make data more realistic
      if (Math.random() < 0.3) continue;

      // Create 1-3 assignments per day
      const assignmentsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < assignmentsPerDay; i++) {
        const route = routes[Math.floor(Math.random() * routes.length)];
        const collector =
          collectors[Math.floor(Math.random() * collectors.length)];

        // Generate realistic trash weight data (1-5 entries per assignment)
        const weightEntries = [];
        const numEntries = Math.floor(Math.random() * 5) + 1;

        for (let j = 0; j < numEntries; j++) {
          weightEntries.push({
            weight: (Math.random() * 50 + 10).toFixed(1), // 10-60 kg per entry
            timestamp: new Date(
              d.getTime() + Math.random() * 24 * 60 * 60 * 1000
            ).toISOString(),
            location: `Điểm ${j + 1}`,
          });
        }

        const assignmentDate = new Date(d);
        const startTime = new Date(assignmentDate);
        startTime.setHours(Math.floor(Math.random() * 8) + 6); // 6-14h
        startTime.setMinutes(Math.floor(Math.random() * 60));

        const endTime = new Date(startTime);
        endTime.setHours(
          startTime.getHours() + Math.floor(Math.random() * 4) + 1
        ); // 1-5 hours later

        assignments.push({
          route_id: route.id,
          collector_id: collector.id,
          assigned_date: assignmentDate,
          time_window_start: `${String(startTime.getHours()).padStart(
            2,
            "0"
          )}:${String(startTime.getMinutes()).padStart(2, "0")}`,
          time_window_end: `${String(endTime.getHours()).padStart(
            2,
            "0"
          )}:${String(endTime.getMinutes()).padStart(2, "0")}`,
          status: AssignmentStatus.COMPLETED,
          started_at: startTime,
          completed_at: endTime,
          trash_weight: weightEntries,
          notes: `Thu gom hoàn thành ngày ${assignmentDate.toLocaleDateString(
            "vi-VN"
          )}`,
        });
      }
    }

    // Insert assignments in batches
    const batchSize = 50;
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

    console.log(
      `🎉 Successfully created ${created} route assignments with trash weight data!`
    );

    // Summary
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

    console.log(`📊 Summary:`);
    console.log(`   - Total assignments: ${created}`);
    console.log(`   - Total weight recorded: ${totalWeight.toFixed(1)} kg`);
    console.log(
      `   - Date range: ${startDate.toLocaleDateString(
        "vi-VN"
      )} - ${endDate.toLocaleDateString("vi-VN")}`
    );
    console.log(`   - Routes with data: ${routes.length}`);
    console.log(`   - Collectors involved: ${collectors.length}`);
  } catch (error) {
    console.error("❌ Error creating trash weight test data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createTrashWeightTestData();
