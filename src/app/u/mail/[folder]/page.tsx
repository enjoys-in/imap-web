import serverAxios from "@/lib/api/serverAxios";

import { Suspense } from "react";

import ClientMailCard from "./_components/ClientMailCard";
import Loading from "../loading";
import { SingleEmailResponse } from "@/lib/types/interfaces/EmailResponse";
import { ApiResponse } from "@/lib/types";

export type PageProps = {
  params: {
    folder: string[];
  };
};

export default async function EmailInterface({ params }: any) {
  const { folder } = await params;

  return (
    <Suspense fallback={<Loading />}>
      <ServerMailList folder={folder} />
    </Suspense>
  );
}

async function ServerMailList({ folder }: { folder: string }) {
  try {
    const { data } = await serverAxios.get<ApiResponse<SingleEmailResponse>>(
      "/api/v1/imap/fetch-emails?folder=" + folder
    );

    if (!data.success) {
      throw data.message;
    }
    return <ClientMailCard data={data} />;
  } catch (error) {
    return null;
  }
}
