import { useState } from "react";
import { GoGear } from "react-icons/go";
import { useMutation, useQueryClient } from "react-query";
import { useLabelData } from "../helpers/useLabelData";

export default function IssueLabels({ labels, issueNumber }) {
  const labelQuery = useLabelData();
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const setLabel = useMutation(
    (labelId) => {
      const newLabels = labels.includes(labelId) ? labels.filter((label) => label !== labelId) : [...labels, labelId]
      return fetch(`/api/issues/${issueNumber}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ labels: newLabels }),
      }).then((res) => res.json());
    },
    {
      onMutate: (labelId) => {
        const oldLabels = queryClient.getQueryData(["issues", issueNumber]).labels
        const newLabels = oldLabels.includes(labelId) 
          ? oldLabels.filter((label) => label !== labelId) 
          : [...oldLabels, labelId]
        queryClient.setQueryData(["issues", issueNumber], (data) => ({
          ...data,
          labels: newLabels,
        }));

        return () => {
            queryClient.setQueryData(["issues", issueNumber], (data) => {
              const rollbackLabels = oldLabels.includes(labelId) 
                ? [...data.labels, labelId] : data.labels.filter((label) => label !== labelId) 
              return {  
                ...data,
                labels: rollbackLabels
              }
            })
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
        <span>Labels</span>
        {labelQuery?.isLoading
          ? null
          : labels.map((label) => {
              const labelObject = labelQuery.data.find(
                (queryLabel) => queryLabel.id === label
              );
              if (!labelObject) {
                return null;
              }
              return (
                <span key={label.id} className={`label ${labelObject.color}`}>
                  {labelObject.name}
                </span>
              );
            })}
      </div>
      <GoGear onClick={() => !labelQuery.isLoading && setMenuOpen(!menuOpen)} />
      {menuOpen && (
        <div className="picker-menu labels">
          {labelQuery.data?.map((label) => {
            const selected = labels.includes(label.id)
            return (
              <div
                key={label.id}
                className={selected ? "selected" : ""}
                onClick={() => {
                  setLabel.mutate(label.id)
                }}
              >
                <span className="label-dot"
                  style={{ backgroundColor: label.color }}
                >
                </span>
                {label.name}
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
