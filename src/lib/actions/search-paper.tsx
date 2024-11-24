import { useSearchParams } from "next/navigation";

const SearchPaper = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  return (
    <div>
      {query ? (
        <div>Searching for: {query}</div>
      ) : (
        <div>No search query provided</div>
      )}
    </div>
  );
};

export default SearchPaper;
