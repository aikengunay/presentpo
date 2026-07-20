import type { PrismaClient } from "@/lib/generated/prisma/client";
import type { ParsedClasslist } from "@/lib/import/classlist";

export async function commitClasslist(
  prisma: PrismaClient,
  data: ParsedClasslist,
): Promise<{ sectionId: string; studentCount: number; scheduleCount: number }> {
  return prisma.$transaction(async (tx) => {
    const section = await tx.section.upsert({
      where: { code: data.sectionCode },
      create: {
        code: data.sectionCode,
        subjectName: data.subjectName,
        termLabel: data.termLabel,
      },
      update: {
        subjectName: data.subjectName,
        termLabel: data.termLabel,
      },
    });

    for (const schedule of data.schedules) {
      await tx.meetingTemplate.upsert({
        where: {
          sectionId_dayOfWeek_startTime: {
            sectionId: section.id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
          },
        },
        create: {
          sectionId: section.id,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room,
          roomType: schedule.roomType,
          label: schedule.roomType,
        },
        update: {
          endTime: schedule.endTime,
          room: schedule.room,
          roomType: schedule.roomType,
          label: schedule.roomType,
        },
      });
    }

    for (const student of data.students) {
      await tx.student.upsert({
        where: {
          sectionId_studentId: {
            sectionId: section.id,
            studentId: student.studentId,
          },
        },
        create: {
          sectionId: section.id,
          studentId: student.studentId,
          name: student.name,
          email: student.email,
          status: student.status,
          active: true,
        },
        update: {
          name: student.name,
          email: student.email,
          status: student.status,
          active: true,
        },
      });
    }

    return {
      sectionId: section.id,
      studentCount: data.students.length,
      scheduleCount: data.schedules.length,
    };
  });
}
