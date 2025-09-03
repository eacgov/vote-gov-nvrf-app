import { useQuery } from "@tanstack/react-query";

// const BASE_URL = "https://vote.gov";

const BASE_URL = window.location.origin.includes("localhost:5173")
  ? "https://vote-gov-acquia.ddev.site" // dev server should pull from DDEV
  : window.location.origin;   // prod/stage uses current host

export function useFetchData(url, uuid, first = false) {
  const { data, isError, isLoading } = useQuery({
    queryKey: [url + uuid],
    queryFn: async () => {
      const response = await fetch(url);
      const fetchedData = await response.json();
      // If UUID is provided, filter data by UUID.
      const finalData = uuid
        ? fetchedData.find((item) => item.uuid === uuid)
        : first
          ? fetchedData[0]
          : fetchedData;
      return finalData;
    },
  });

  return { data, isError, isLoading };
}
