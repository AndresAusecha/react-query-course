
import { useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import { GoIssueOpened, GoIssueClosed, GoComment } from "react-icons/go";
import { relativeDate } from "../helpers/relativeDate";
import { userUserData } from "../helpers/useUserData";
import { Label } from "./Label";
import { useState } from "react";
import fetchWithError from "../helpers/fetchWithError";
import Loader from "./Loader";


const IssueItem = (props) => {
  const {
    title,
    number,
    assignee,
    commentCount,
    createdBy,
    createdAt,
    labels,
    status,
  } = props;
  const assigneUser = userUserData(assignee);
  const createdByUser = userUserData(createdBy);
  const queryClient = useQueryClient();
  return (
    <li onMouseEnter={() => {
      queryClient.prefetchQuery(["issues", number.toString()], () => fetchWithError(`/api/issues/${number}`))
      queryClient.prefetchQuery(["issues", number.toString(), "comments"], () => fetchWithError(`/api/issues/${number}/comments`))
    }}>
      <div>
        {status === "done" || status === "cancelled" ? (
          <GoIssueClosed style={{ color: "red" }} />
        ) : (
          <GoIssueOpened style={{ color: "green" }} />
        )}
      </div>
      <div className="issue-content">
        <span>
          <Link to={`/issue/${number}`}>
            {title}
          </Link>
          {labels.map((label) => (
            <Label key={label} label={label} />
          ))}
        </span>
        <small>
          #{number} opened {relativeDate(createdAt)}
          {` by ${createdByUser.isSuccess ? createdByUser.data.name : ""}`}
        </small>
      </div>
      {assignee ? (
        <img src={assigneUser.isSuccess
          ? assigneUser.data.profilePictureUrl
          : ""}
          className="assigned-to"
          alt="Assigned to avatar"
        />
      ) : null}
      <span className="comment-count">
        {commentCount > 0 ? (
          <>
            <GoComment />
            {commentCount}
          </>
        ) : null}
      </span>
    </li>
  )
}

export default function IssuesList({
  labels,
  status,
  pageNum,
  setPageNum
}) {

  const queryClient = useQueryClient();
  const { isLoading, data, isError, error, isFetching, isPreviousData } = useQuery(
    ["issues", { labels, status, pageNum }],
    async () => {
      const statusString = status && `&status=${status}`
      const labelsString = labels
        .map((label) => `labels[]=${label.name}`).join("&")
      const paginationString = pageNum ? `&page=${pageNum}` : "";
      const results = await fetchWithError(`/api/issues?${labelsString}${statusString}${paginationString}`)
      results.forEach(issue => {
        queryClient.setQueryData(["issues", issue.number.toString()], issue)
      });

      return results
    },
    {
      keepPreviousData: true
    }
  );
  const [searchValue, setSearchValue] = useState("");

  const searchQuery = useQuery(
    ["issues", "search", searchValue],
    ({ signal }) => fetchWithError(`/api/search/issues?q=${searchValue}`, { signal })
    ,
    {
      enabled: searchValue.length > 0
    });

  console.log(searchQuery);

  return (
    <div>
      <form
        onSubmit={(e) => {
          console.log(e.target.elements.search.value); 
          e.preventDefault();
          setSearchValue(e.target.elements.search.value);
        }}
      >
        <label htmlFor=""></label>
        <input type="search" placeholder="Search" name="search" id="search" onChange={(e) => {
          if (e.target.value.length === 0) {
            setSearchValue("");
          }
        }} />
      </form>
      <h1>Issues List</h1>
      {isLoading
        ? <Loader />
        : isError
          ? <p>{error.message}</p>
          : searchQuery.status === "idle"
            ? (
              <>
                <ul className="issues-list">
                  {data.map((issue) =>
                    <IssueItem
                    key={issue.id}
                    title={issue.title}
                    number={issue.number}
                    assignee={issue.assignee}
                    commentCount={issue.comments.length}
                    createdBy={issue.createdBy}
                    createdAt={issue.createdDate}
                    labels={issue.labels}
                    status={issue.status}
                    {...issue}
                    />
                  )}
                </ul>
                <div className="pagination">
                  <button 
                    disabled={pageNum === 1}
                    onClick={() => {
                      if (pageNum - 1 > 0) {
                        setPageNum(pageNum -1)
                      }
                    }}
                  >
                    Previous
                  </button>
                  <p>Page {pageNum}</p>
                  <button 
                    disabled={data?.length === 0 || isPreviousData}
                    onClick={() => {
                      if (data?.length !== 0 && !isPreviousData) {
                        setPageNum(pageNum + 1)
                      }
                    }}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>Search results</h2>
                {searchQuery.isLoading ? <p>Loading...</p> : (
                  <>
                    <p>
                      {searchQuery?.data?.count} Results
                    </p>
                    <ul className="issues-list">
                      {searchQuery?.data?.items?.map((issue) => (
                        <IssueItem
                          key={issue.id}
                          title={issue.title}
                          number={issue.number}
                          assignee={issue.assignee}
                          commentCount={issue.comments.length}
                          createdBy={issue.createdBy}
                          createdAt={issue.createdDate}
                          labels={issue.labels}
                          status={issue.status}
                          {...issue}
                        />
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
    </div>
  );
}
