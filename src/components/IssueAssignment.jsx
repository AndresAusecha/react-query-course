import { userUserData } from "../helpers/useUserData";
import { GoGear } from "react-icons/go";  
import { useState } from "react"; 
import { useMutation, useQuery, useQueryClient } from "react-query";

export const IssueAssignment = ({ assignee, issueNumber }) => {
  const user = userUserData(assignee)
  const [menuOpen, setMenuOpen] = useState(false)
  const usersQuery = useQuery(["users"], () => fetch('/api/users').then((res) => res.json()))

  const queryClient = useQueryClient();
  const setAssignment = useMutation(
    (assignee) => {
      return fetch(`/api/issues/${issueNumber}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ assignee }),
      }).then((res) => res.json());
    },
    {
      onMutate: (assignee) => {
        const oldAssignee = queryClient.getQueryData(["issues", issueNumber]).assignee
        queryClient.setQueryData(["issues", issueNumber], (data) => ({
          ...data,
          assignee,
        }));

        return () => {
            queryClient.setQueryData(["issues", issueNumber], (data) => ({
                ...data,
                assignee: oldAssignee
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
        <span>Assignment</span>
        {user.isSuccess && (
          <div>
            <img src={user.data.profilePictureUrl} alt="" srcset="" />
            {user.data.name}
          </div>
        )}
        <GoGear onClick={() => !usersQuery.isLoading && setMenuOpen(!menuOpen)}/>
        {menuOpen && (
          <div className="picker-menu">
            {usersQuery.data?.map((user) => (
              <div key={user.id} onClick={() => {
                setAssignment.mutate(user.id)
              }}>
                <img src={user.profilePictureUrl} alt="" srcset="" />
                {user.name}
              </div>
            ))}
          </div>
        )}
    </div>
  );
};
