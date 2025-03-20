"use client";

import { useParams } from "next/navigation";
import EditCamp from "../../../../pages/Organizer/EditCamp";

export default function EditCampsPage() {
  const params = useParams();
  
  return <EditCamp params={{ id: params?.id as string }} />;
}