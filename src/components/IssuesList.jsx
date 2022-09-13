
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { GoIssueOpened, GoIssueClosed, GoComment } from "react-icons/go";
import { relativeDate } from "../helpers/relativeDate";
import { userUserData } from "../helpers/useUserData";
import { Label } from "./Label";


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
  return (
    <li>
      <div>
        {status === "done" || status === "cancelled" ? (
          <GoIssueClosed  style={{ color: "red" }} />
        ) : (
          <GoIssueOpened  style={{ color: "green" }} />
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
  status
}) {
  
  const { isLoading, data } = useQuery(
    ["issues", {labels, status}],
    () => {
      const statusString = status && `&status=${status}`
      const labelsString = labels
        .map((label) => `labels[]=${label.name}`).join("&")
      return fetch(`/api/issues?${labelsString}${statusString}`)
        .then((res) => res.json())
    }
  );
  console.log(data);
  return (
    <div>
      <h1>Issues List</h1>
      {isLoading
        ? <p>Loading...</p>
        : (
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
            )
            }
          </ul>
        )}
    </div>
  );
}
