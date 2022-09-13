import { GoIssueClosed, GoIssueOpened } from "react-icons/go";
import { relativeDate } from "../helpers/relativeDate";
import { userUserData } from "../helpers/useUserData";
import { possibleStatus } from "../pages/StatusSelect";

export const IssueHeader = ({
  title, number, status = "todo", createdBy, createdDate, comments
}) => {
  const statusObject = possibleStatus.find((pStatus) => pStatus.id === status);

  const createdUser = userUserData(createdBy);

  console.log(comments.length);
  return (
    <header>
      <h2>
        {title} <span>#{number}</span>
      </h2>
      <div>
        <span className={status === "done" || status === "cancelled"
          ? "closed"
          : "open"}
        >
          {status === "done" || status === "cancelled" ? (
            <GoIssueClosed />
          ) : (
            <GoIssueOpened />
          )}
          {statusObject.label}
        </span>
        <span className="created-by">
          {createdUser.isLoading ? <p>Loading...</p> : createdUser.data.name}
        </span>
        opened this issue {relativeDate(createdDate)} * {comments.length} comments
      </div>
    </header>
  );
};
