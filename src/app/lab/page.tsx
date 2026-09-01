import { InnovationLab } from "@/components/sections/InnovationLab";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LabCanvas } from "@/components/three/LabCanvas";

export const metadata = { title: "Innovation Lab" };

export default function LabPage() {
  return (
    <div className="pt-16">
      <div className="container-traic pt-16">
        <SectionHeader
          label="EXPERIMENTATION BAY"
          title="The Lab"
          description="Interactive simulations of TRAIC systems. Visual storytelling — not live hardware telemetry."
        />
        <div className="mb-8">
          <LabCanvas variant="arm" />
        </div>
      </div>
      <InnovationLab />
    </div>
  );
}
