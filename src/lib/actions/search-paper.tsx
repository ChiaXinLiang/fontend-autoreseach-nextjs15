import { useSearchParams } from "next/navigation";

const SearchPaper = () => {
  const { query } = useSearchParams();

  const searchQuery = query.get("query");

  return <div>SearchPaper</div>;
};

export default SearchPaper;
