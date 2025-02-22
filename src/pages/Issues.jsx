import * as React from 'react';
import { Link } from 'react-router-dom';
import IssuesList from "../components/IssuesList";
import LabelList from "../components/LabelList";
import { StatusSelect } from './StatusSelect';

export default function Issues() {
  const [labels, setLabels] = React.useState([]);
  const [status, setStatus] = React.useState("");
  const [pageNum, setPageNum] = React.useState(1)
  return (
    <div>
      <main>
        <section>
          <h1>Issues</h1>
          <IssuesList labels={labels} status={status} pageNum={pageNum} setPageNum={setPageNum} />
        </section>
        <aside>
          <LabelList 
            selected={labels} 
            toggle={(label) => {
                setLabels(
                currentLabels => currentLabels.includes(label)
                ? currentLabels.filter(currentLabel => currentLabel !== label)
                : currentLabels.concat(label)
              )
              setPageNum(1)
            }}
          />
          <h3>Status</h3>
          <StatusSelect 
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPageNum(1)
            }}
          />
          <Link className='button' to="/add">
            Add issue
          </Link>
        </aside>
      </main>
    </div>
  );
}
