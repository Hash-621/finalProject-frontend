import DefaultLayout from "@/components/layouts/DefaultLayout";
import Jobs from "@/components/sections/Jobs";
import TourCurse from "@/components/sections/TourCurse";
import Utils from "@/components/sections/Utils";
import Visual from "@/components/sections/Visual";

export default function Home() {
  return (
    <DefaultLayout>
      <Visual />
      <Utils />
      <Jobs />
      <TourCurse />
    </DefaultLayout>
  );
}
