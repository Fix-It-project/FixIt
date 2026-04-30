import { Redirect, useLocalSearchParams } from "expo-router";
import { ROUTES } from "@/src/lib/routes";

export default function BookingIndex() {
  const params = useLocalSearchParams<{
    technicianId: string;
    technicianName?: string;
    serviceId?: string;
    serviceName?: string;
    categoryId?: string;
    categoryName?: string;
  }>();
  const bookingDateRoute = ROUTES.user.bookingDate(params.technicianId ?? "");

  const { category, summary, estimated_cost } = useLocalSearchParams();

  return (
    <Redirect
      href={{
        ...bookingDateRoute,
        params: {
          ...bookingDateRoute.params,
          technicianName: params.technicianName,
          serviceId: params.serviceId,
          serviceName: params.serviceName,
          categoryId: params.categoryId,
          categoryName: params.categoryName,
          category,
          summary,
          estimated_cost,
        },
      }}
    />
  );
}
