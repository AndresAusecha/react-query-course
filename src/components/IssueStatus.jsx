import { useMutation, useQueryClient } from "react-query";
import { StatusSelect } from "../pages/StatusSelect";

export default function IssueStatus({ status, issueNumber }) {
  const queryClient = useQueryClient();
  const setStatus = useMutation(
    (status) => {
      return fetch(`/api/issues/${issueNumber}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ status }),
      }).then((res) => res.json());
    },
    {
      onMutate: (status) => {
        const oldStatus = queryClient.getQueryData(["issues", issueNumber]).status
        queryClient.setQueryData(["issues", issueNumber], (data) => ({
          ...data,
          status,
        }));

        return () => {
            queryClient.setQueryData(["issues", issueNumber], (data) => ({
                ...data,
                status: oldStatus
            }))
        }
      },
      onError: (err,vars,rollback) => {
        rollback()
      },
      onSettled: () => {
        queryClient.invalidateQueries(["issues", issueNumber], { exact: true })
      }
    }
  );
  return (
    <div className="issue-options">
      <div>
        <span>Status</span>
        <StatusSelect noEmptyOption value={status} onChange={(event) => {
            setStatus.mutate(event.target.value)
        }} />
      </div>
    </div>
  );
}
