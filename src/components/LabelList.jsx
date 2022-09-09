import { useLabelData } from "../helpers/useLabelData";

export default function LabelList({
  selected,
  toggle
}) {
  const labelsQuery = useLabelData();

  return (
    <div className="labels">
      <h3>Labels</h3>
      {labelsQuery.isLoading ? (
        <p>loading</p>
      ) :
        <ul>
          {labelsQuery.data.map((label) => (
            <li>
              <button
                onClick={() => toggle(label)}
                className={
                  `${selected.includes(label.id) 
                    ? "selected" 
                    : ""} 
                  ${label.color}`}
              >
                {label.name}
              </button>
            </li>
          ))}
        </ul>
      }
    </div>
  );
}
