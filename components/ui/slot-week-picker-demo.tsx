"use client";

import { SlotWeekPicker } from "@/components/ui/slot-week-picker";

const sampleNow = "2027-08-02T09:30:00+01:00";
const slots = [
  { start: "2027-08-02T09:00:00+01:00" },
  { start: "2027-08-02T10:30:00+01:00" },
  { start: "2027-08-02T12:30:00+01:00", unavailableReason: "Reserved in this example" },
  { start: "2027-08-02T13:00:00+01:00" },
  { start: "2027-08-02T15:30:00+01:00" },
  { start: "2027-08-04T11:00:00+01:00" },
  { start: "2027-08-06T10:30:00+01:00" },
  { start: "2027-08-06T11:00:00+01:00" },
  { start: "2027-08-09T10:00:00+01:00" },
  { start: "2027-08-09T13:30:00+01:00", unavailableReason: "Reserved in this example" },
  { start: "2027-08-11T14:00:00+01:00" },
  { start: "2027-08-13T11:30:00+01:00" },
] as const;

export default function SlotWeekPickerDemo() {
  return (
    <div className="mx-auto grid w-full max-w-lg gap-3 px-4 py-8 sm:px-6">
      <p className="text-sm text-muted-foreground">Sample availability. Demo selections stay on this page.</p>
      <SlotWeekPicker
        slots={slots}
        timeZone="Europe/London"
        slotMinutes={30}
        minNoticeHours={2}
        now={sampleNow}
        title="Pick a time"
        confirmationLabel="Confirm sample time"
        successMessage="Sample time confirmed."
        onConfirm={async () => {
          await new Promise<void>((resolve) => window.setTimeout(resolve, 800));
        }}
      />
    </div>
  );
}
