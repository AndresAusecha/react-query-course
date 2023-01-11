import { useInfiniteQuery, useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { relativeDate } from "../helpers/relativeDate";
import { userUserData } from "../helpers/useUserData";
import { IssueAssignment } from "./IssueAssignment";
import { IssueHeader } from "./IssueHeader";
import IssueLabels from "./IssueLabels";
import IssueStatus from "./IssueStatus";
import Loader from "./Loader";

function useIssueData(issueNumber) {
  return useQuery(["issues", issueNumber],
    () => {
      return fetch(`/api/issues/${issueNumber}`)
        .then((res) => res.json())
    });
}

function useIssueComments(issueNumber) {
  return useInfiniteQuery(
    ["issues", issueNumber, "comments"],
    ({ signal, pageParam }) => {
      return fetch(`/api/issues/${issueNumber}/comments?page=${pageParam}`).then((res) => res.json())
    }
  , {
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length === 0) return;
      return pages.length + 1
    }
  })
}

function Comment({ comment, createdBy, createdDate }) {
  const userQuery = userUserData(createdBy);

  if (userQuery.isLoading) return <div className="comment">
    <div className="comment-header">
      <p>Loading...</p>
    </div>
  </div>

  return (
    <div className="comment">
      <img src={userQuery.data.profilePictureUrl} alt="" srcset="" />
      <div>
        <div className="comment-header">
          <span>{userQuery.data.name}</span> commented
          <span>{relativeDate(createdDate)}</span>
        </div>
        <div className="comment-body">
          {comment}
        </div>
      </div>
    </div>
  )
}

export default function IssueDetails() {
  const { number } = useParams();

  const issueQuery = useIssueData(number);

  const commentsQuery = useIssueComments(number);

  console.log(commentsQuery.data);

  return <div className="issue-details">
    {issueQuery.isLoading ? <p>Loading...</p>
      : (
        <>
          <IssueHeader
            number={number}
            title={issueQuery.data.title}
            comments={issueQuery.data.comments}
            createdBy={issueQuery.data.createdBy}
            createdDate={issueQuery.data.createdDate}
          />
          <main>
            <section>
              {commentsQuery.isLoading ? <p>
                Loading...
              </p>
                : (
                  commentsQuery.data?.pages?.map(
                    (commentPage) => commentPage.map((comment) => (
                      <Comment
                        comment={comment.comment}
                        createdBy={issueQuery.data.createdBy}
                        createdDate={issueQuery.data.createdDate}
                      />
                    )))
                )
              }
              <section>
                <button onClick={() => {
                  commentsQuery.fetchNextPage()
                }}>
                  Next page
                </button>
                {commentsQuery.isFetchingNextPage && (
                  <Loader />
                )}
              </section>
            </section>
            <aside>
              <IssueStatus 
                status={issueQuery.data.status}
                issueNumber={issueQuery.data.number.toString()}

              />
              <IssueAssignment
                assignee={issueQuery.data.assignee}
                issueNumber={issueQuery.data.number.toString()}
              />
              <IssueLabels 
                labels={issueQuery.data.labels} 
                issueNumber={issueQuery.data.number.toString()}
              />
            </aside>
          </main>
        </>
      )}
  </div>;
}
