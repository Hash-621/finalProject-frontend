import DefaultLayout from "@/components/layouts/DefaultLayout";
import Utils from "@/components/sections/Utils";
import Visual from "@/components/sections/Visual";

export default function Home() {
  return (
    <DefaultLayout>
      <Visual />
      <Utils />
    </DefaultLayout>
  );
}
